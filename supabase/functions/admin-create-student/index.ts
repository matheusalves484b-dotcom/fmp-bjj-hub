import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido." }, 405);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Não autenticado." }, 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Configuração interna do Supabase ausente." }, 500);

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: "Sessão inválida ou expirada." }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: actor, error: actorError } = await admin.from("profiles").select("id, role").eq("id", user.id).maybeSingle();
  if (actorError) return json({ error: actorError.message }, 500);
  if (!actor || !["OWNER", "ADMIN", "TEACHER"].includes(actor.role)) return json({ error: "Você não tem permissão para cadastrar alunos." }, 403);

  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const fullName = String(body?.full_name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  if (!email || !password || password.length < 6 || !fullName) return json({ error: "Nome, e-mail e senha (mínimo 6 caracteres) são obrigatórios." }, 400);

  const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: fullName, phone } });
  if (createError || !created.user) return json({ error: createError?.message ?? "Não foi possível criar o usuário." }, 400);
  const studentId = created.user.id;

  const { error: profileError } = await admin.from("profiles").update({ full_name: fullName, phone: phone || null, role: "STUDENT" }).eq("id", studentId);
  if (profileError) { await admin.auth.admin.deleteUser(studentId); return json({ error: profileError.message }, 500); }

  const { error: studentError } = await admin.from("student_profiles").insert({ user_id: studentId, birth_date: body?.birth_date || null, cpf: body?.cpf || null, emergency_contact_name: body?.emergency_contact_name || null, emergency_contact_phone: body?.emergency_contact_phone || null, status: body?.status ?? "ACTIVE", enrollment_date: body?.enrollment_date || new Date().toISOString().slice(0, 10), notes: body?.notes || null });
  if (studentError) { await admin.from("profiles").delete().eq("id", studentId); await admin.auth.admin.deleteUser(studentId); return json({ error: studentError.message }, 500); }
  return json({ user_id: studentId, message: "Aluno cadastrado com sucesso." }, 201);
});

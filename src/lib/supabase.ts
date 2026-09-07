import { createClient } from "@supabase/supabase-js";

const EXPECTED_SUPABASE_PROJECT_REF = "mgbfvznmgbfoddymvogt";
const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"]?.trim();
const supabasePublishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();

function getSupabaseConfig() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Supabase não configurado neste ambiente. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no ambiente de build.",
    );
  }

  let projectRef: string | null = null;

  try {
    const hostname = new URL(supabaseUrl).hostname;
    const match = hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
    projectRef = match?.[1] ?? null;
  } catch {
    throw new Error("VITE_SUPABASE_URL inválida. Informe a URL do projeto Supabase Gestão FMP BJJ.");
  }

  if (projectRef !== EXPECTED_SUPABASE_PROJECT_REF) {
    throw new Error(
      `Ambiente Supabase incorreto. O Gestão FMP BJJ deve usar o projeto ${EXPECTED_SUPABASE_PROJECT_REF}, mas este ambiente está apontando para ${projectRef ?? "um projeto desconhecido"}.`,
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}

const config = getSupabaseConfig();

export const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

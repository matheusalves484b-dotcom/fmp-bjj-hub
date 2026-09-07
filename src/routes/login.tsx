import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({ component: LoginPage });

type Mode = "login" | "signup" | "reset";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        navigate({ to: "/" });
      } else if (mode === "signup") {
        if (password.length < 6) throw new Error("A senha precisa ter pelo menos 6 caracteres.");
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() } } });
        if (authError) throw authError;
        if (data.session) navigate({ to: "/" });
        else {
          setMessage("Cadastro criado. Confira seu e-mail para confirmar a conta antes de entrar.");
          setMode("login");
          setPassword("");
        }
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/login` });
        if (authError) throw authError;
        setMessage("Enviamos as instruções de recuperação para seu e-mail.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a operação.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Crie seu acesso" : "Recupere sua senha";
  const subtitle = mode === "login" ? "Entre no painel da Gestão FMP BJJ." : mode === "signup" ? "O primeiro cadastro da academia recebe acesso de proprietário." : "Informe seu e-mail para receber um link seguro.";

  return (
    <main className="min-h-screen bg-ink text-foreground dashboard-atmosphere px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <section className="w-full rounded-3xl border border-hairline bg-panel/90 p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">F</div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faint">Gestão FMP BJJ</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-mist">{subtitle}</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && <label className="block"><span className="mb-2 block text-xs font-medium text-mist">Nome completo</span><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" /><input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" className="h-11 w-full rounded-xl border border-hairline bg-obsidian pl-10 pr-3 text-sm outline-none transition focus:border-primary" placeholder="Seu nome" /></div></label>}
            <label className="block"><span className="mb-2 block text-xs font-medium text-mist">E-mail</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-11 w-full rounded-xl border border-hairline bg-obsidian pl-10 pr-3 text-sm outline-none transition focus:border-primary" placeholder="voce@exemplo.com" /></div></label>
            {mode !== "reset" && <label className="block"><span className="mb-2 block text-xs font-medium text-mist">Senha</span><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} className="h-11 w-full rounded-xl border border-hairline bg-obsidian pl-10 pr-11 text-sm outline-none transition focus:border-primary" placeholder="••••••••" /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-foreground">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></label>}
            {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs leading-5 text-red-300">{error}</div>}
            {message && <div role="status" className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-xs leading-5 text-accent-soft">{message}</div>}
            <button disabled={busy} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{busy && <Loader2 className="size-4 animate-spin" />}{mode === "login" ? "Entrar no painel" : mode === "signup" ? "Criar minha conta" : "Enviar recuperação"}</button>
          </form>
          <div className="mt-6 space-y-3 text-center text-xs text-faint">
            {mode === "login" && <><button onClick={() => { setMode("reset"); setError(""); setMessage(""); }} className="font-medium text-mist hover:text-foreground">Esqueci minha senha</button><div>ou</div><button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="font-medium text-accent-soft hover:underline">Criar primeiro acesso</button></>}
            {mode !== "login" && <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="font-medium text-accent-soft hover:underline">Voltar para o login</button>}
          </div>
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-hairline pt-5 text-[10px] text-faint"><ShieldCheck className="size-3.5" />Acesso protegido pelo Supabase Auth</div>
        </section>
      </div>
    </main>
  );
}

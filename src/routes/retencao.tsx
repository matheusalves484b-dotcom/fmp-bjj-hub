import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Cake, CheckCircle2, RefreshCw, Search, UserRound } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/retencao")({
  head: () => ({ meta: [{ title: "Retenção — Gestão FMP BJJ" }] }),
  component: Retencao,
});

type RiskRow = { user_id: string; full_name: string; avatar_url: string | null; last_checkin_date: string | null; at_risk: boolean; days_since_checkin: number | null };
type BirthdayRow = { user_id: string; full_name: string; avatar_url: string | null; birth_date: string; birthday_day: number };

function Retencao() {
  const [risk, setRisk] = useState<RiskRow[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayRow[]>([]);
  const [search, setSearch] = useState("");
  const [onlyRisk, setOnlyRisk] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setRefreshing(true); setError("");
    const [riskRes, birthdayRes] = await Promise.all([
      supabase.from("student_retention_status").select("user_id,full_name,avatar_url,last_checkin_date,at_risk,days_since_checkin").order("at_risk", { ascending: false }).order("days_since_checkin", { ascending: false, nullsFirst: true }),
      supabase.from("monthly_birthday_students").select("user_id,full_name,avatar_url,birth_date,birthday_day").order("birthday_day"),
    ]);
    if (riskRes.error || birthdayRes.error) setError(riskRes.error?.message || birthdayRes.error?.message || "Não foi possível carregar os dados.");
    else { setRisk((riskRes.data || []) as RiskRow[]); setBirthdays((birthdayRes.data || []) as BirthdayRow[]); }
    setLoading(false); setRefreshing(false);
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => risk.filter((s) => (!onlyRisk || s.at_risk) && s.full_name.toLowerCase().includes(search.toLowerCase())), [risk, search, onlyRisk]);
  const atRiskCount = risk.filter((s) => s.at_risk).length;
  const safeCount = risk.length - atRiskCount;

  return <AuthGuard allowedRoles={["OWNER", "ADMIN", "TEACHER"]}><div className="min-h-screen bg-ink text-foreground">
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-hairline bg-obsidian/90 px-4 backdrop-blur sm:px-6">
      <div><h1 className="text-[15px] font-semibold">Retenção & relacionamento</h1><p className="mt-1 font-mono text-[10px] uppercase tracking-[.15em] text-faint">Saúde da base · acompanhamento</p></div>
      <button onClick={() => void load()} className="ml-auto inline-flex h-9 items-center gap-2 rounded-lg border border-hairline bg-panel px-3 text-xs text-mist hover:border-primary"><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} /> Atualizar</button>
    </header>
    <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">
      {error && <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric icon={<AlertTriangle className="size-4" />} label="Precisam de atenção" value={atRiskCount} hint="14+ dias sem check-in" />
        <Metric icon={<CheckCircle2 className="size-4" />} label="Em dia" value={safeCount} hint="Check-in nos últimos 14 dias" />
        <Metric icon={<Cake className="size-4" />} label="Aniversariantes" value={birthdays.length} hint="Alunos ativos neste mês" />
      </section>
      <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_.8fr]">
        <article className="rounded-2xl bg-panel/70 p-5 ring-1 ring-inset ring-white/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div><h2 className="text-[15px] font-semibold">Radar de retenção</h2><p className="mt-1 text-xs text-faint">Identifique rapidamente quem pode estar se afastando.</p></div><div className="sm:ml-auto flex gap-2"><label className="flex h-9 items-center gap-2 rounded-lg border border-hairline bg-obsidian px-3"><Search className="size-3.5 text-faint"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar aluno" className="w-full bg-transparent text-xs outline-none placeholder:text-faint sm:w-44"/></label><button onClick={() => setOnlyRisk(!onlyRisk)} className={`h-9 rounded-lg border px-3 text-xs ${onlyRisk ? "border-primary/40 bg-primary/15 text-accent-soft" : "border-hairline bg-obsidian text-mist"}`}>{onlyRisk ? "Em risco" : "Todos"}</button></div></div>
          {loading ? <div className="py-12 text-center text-xs text-faint">Carregando...</div> : filtered.length === 0 ? <div className="py-12 text-center"><UserRound className="mx-auto size-8 text-faint"/><p className="mt-2 text-sm">Nenhum aluno encontrado.</p></div> : <div className="mt-4 divide-y divide-hairline">{filtered.map((s) => <div key={s.user_id} className="flex items-center gap-3 py-3"><div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-obsidian ring-1 ring-inset ring-white/5">{s.avatar_url ? <img src={s.avatar_url} alt="" className="size-full object-cover"/> : <UserRound className="size-4 text-faint"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium">{s.full_name}</p><p className="mt-0.5 text-[10px] text-faint">{s.last_checkin_date ? `Último check-in: ${new Date(`${s.last_checkin_date}T12:00:00`).toLocaleDateString("pt-BR")}` : "Ainda não possui check-in"}</p></div><div className="text-right">{s.at_risk ? <><p className="font-mono text-xs text-red-300">{s.days_since_checkin ?? "14+"} dias</p><p className="text-[10px] text-faint">sem presença</p></> : <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">Em dia</span>}</div></div>)}</div>}
        </article>
        <article className="rounded-2xl bg-panel/70 p-5 ring-1 ring-inset ring-white/5"><div className="flex items-start justify-between"><div><h2 className="text-[15px] font-semibold">Aniversariantes</h2><p className="mt-1 text-xs text-faint">Celebre os alunos neste mês.</p></div><Cake className="size-5 text-accent-soft"/></div><div className="mt-4 space-y-2">{birthdays.length === 0 ? <p className="py-8 text-center text-xs text-faint">Nenhum aniversariante cadastrado.</p> : birthdays.map((s) => <div key={s.user_id} className="flex items-center gap-3 rounded-xl bg-obsidian/70 px-3 py-2.5"><div className="grid size-9 place-items-center overflow-hidden rounded-full bg-panel">{s.avatar_url ? <img src={s.avatar_url} alt="" className="size-full object-cover"/> : <Cake className="size-4 text-faint"/>}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{s.full_name}</p><p className="text-[10px] text-faint">{new Date(`${s.birth_date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</p></div><span className="font-mono text-sm text-accent-soft">{String(s.birthday_day).padStart(2, "0")}</span></div>)}</div></article>
      </section>
    </main>
  </div></AuthGuard>;
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint: string }) { return <article className="rounded-2xl bg-panel/70 p-5 ring-1 ring-inset ring-white/5"><div className="flex items-center gap-2 text-faint">{icon}<span className="font-mono text-[10px] uppercase tracking-[.16em]">{label}</span></div><p className="mt-3 font-mono text-3xl font-semibold">{value}</p><p className="mt-1 text-[11px] text-faint">{hint}</p></article>; }

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, CalendarDays, Check, Clock3, Medal, Plus, Search, X } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/graduacoes")({
  head: () => ({ meta: [{ title: "Graduações — Gestão FMP BJJ" }] }),
  component: Graduacoes,
});

type Belt = { id: string; name: string; color: string; display_order: number; min_months_in_grade: number };
type Student = { student_id: string; full_name: string; belt_id: string | null; belt_name: string; degree: number; last_graduation_date: string | null; grade_start_date: string | null; months_in_current_grade: number; min_months_required: number; eligible: boolean };

type Graduation = { id: string; student_id: string; belt_id: string; degree: number; graduation_date: string; notes: string | null; recorded_by: string | null; student_name?: string; belt_name?: string };

const degreeLabel = (degree: number) => degree === 0 ? "Sem grau" : `${degree}º grau`;
const formatDate = (value: string | null) => value ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`)) : "—";

function Graduacoes() {
  return <AuthGuard allowedRoles={["OWNER", "ADMIN", "TEACHER"]}><GraduacoesContent /></AuthGuard>;
}

function GraduacoesContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [belts, setBelts] = useState<Belt[]>([]);
  const [history, setHistory] = useState<Graduation[]>([]);
  const [search, setSearch] = useState("");
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [form, setForm] = useState({ belt_id: "", degree: "0", graduation_date: new Date().toISOString().slice(0, 10), notes: "" });

  const load = async () => {
    setLoading(true); setError("");
    const [studentsRes, beltsRes, historyRes] = await Promise.all([
      supabase.from("student_graduation_status").select("student_id,full_name,belt_id,belt_name,degree,last_graduation_date,grade_start_date,months_in_current_grade,min_months_required,eligible").order("full_name"),
      supabase.from("belts").select("id,name,color,display_order,min_months_in_grade").order("display_order"),
      supabase.from("student_graduations").select("id,student_id,belt_id,degree,graduation_date,notes,recorded_by,profiles!student_graduations_recorded_by_fkey(full_name),belts!student_graduations_belt_id_fkey(name)").order("graduation_date", { ascending: false }).limit(100),
    ]);
    if (studentsRes.error) setError(studentsRes.error.message); else setStudents((studentsRes.data ?? []) as Student[]);
    if (!beltsRes.error) setBelts((beltsRes.data ?? []) as Belt[]);
    if (!historyRes.error) setHistory((historyRes.data ?? []).map((row: any) => ({ ...row, student_name: studentsRes.data?.find((s: any) => s.student_id === row.student_id)?.full_name ?? "Aluno", belt_name: row.belts?.name ?? "—" })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => students.filter(s => (!onlyEligible || s.eligible) && s.full_name.toLowerCase().includes(search.toLowerCase())), [students, search, onlyEligible]);

  const openGraduation = (student: Student) => {
    const currentIndex = belts.findIndex(b => b.id === student.belt_id);
    const next = belts[Math.min(currentIndex + 1, Math.max(0, belts.length - 1))];
    setSelected(student);
    setForm({ belt_id: next?.id ?? student.belt_id ?? belts[0]?.id ?? "", degree: String(student.degree < 4 ? student.degree + 1 : 0), graduation_date: new Date().toISOString().slice(0, 10), notes: "" });
  };

  const save = async () => {
    if (!selected || !form.belt_id) return;
    setSaving(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error: saveError } = await supabase.from("student_graduations").insert({ student_id: selected.student_id, belt_id: form.belt_id, degree: Number(form.degree), graduation_date: form.graduation_date, notes: form.notes || null, recorded_by: user?.id ?? null });
    if (saveError) setError(saveError.message); else { setNotice(`Graduação de ${selected.full_name} registrada.`); setSelected(null); await load(); }
    setSaving(false);
  };

  return <div className="min-h-screen bg-ink text-foreground"><main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7">
    <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-faint">Evolução técnica</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Graduações</h1><p className="mt-1 text-sm text-faint">Acompanhe faixas, graus e alunos aptos à próxima graduação.</p></div><button onClick={() => { const first = filtered[0]; if (first) openGraduation(first); }} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50" disabled={!filtered.length}><Plus className="size-4"/>Lançar graduação</button></header>
    {notice && <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-xs text-accent-soft"><Check className="size-4"/>{notice}</div>}
    {error && <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat icon={<UsersIcon/>} label="Alunos ativos" value={students.length}/><Stat icon={<Award className="size-4"/>} label="Aptos agora" value={students.filter(s => s.eligible).length}/><Stat icon={<Clock3 className="size-4"/>} label="Em preparação" value={students.filter(s => !s.eligible).length}/><Stat icon={<Medal className="size-4"/>} label="Faixas" value={belts.length}/></section>
    <section className="mt-4 rounded-2xl border border-hairline bg-panel/70 p-4 sm:p-5"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." className="h-10 w-full rounded-lg border border-hairline bg-obsidian pl-9 pr-3 text-sm outline-none focus:border-primary"/></label><button onClick={() => setOnlyEligible(v => !v)} className={`h-10 rounded-lg border px-3 text-xs font-medium ${onlyEligible ? "border-primary bg-primary/10 text-accent-soft" : "border-hairline bg-obsidian text-mist"}`}>{onlyEligible ? "Apenas aptos" : "Todos os alunos"}</button></div>
      <div className="mt-4 overflow-hidden rounded-xl border border-hairline"><div className="hidden grid-cols-[1.5fr_1fr_.8fr_.8fr_1fr_auto] gap-3 bg-obsidian px-4 py-3 font-mono text-[9px] uppercase tracking-[.16em] text-faint md:grid"><span>Aluno</span><span>Faixa</span><span>Grau</span><span>Tempo</span><span>Status</span><span/></div>{loading ? <div className="px-4 py-10 text-center text-sm text-faint">Carregando graduações...</div> : filtered.map(student => <div key={student.student_id} className="grid gap-3 border-t border-hairline px-4 py-4 md:grid-cols-[1.5fr_1fr_.8fr_.8fr_1fr_auto] md:items-center"><div><p className="text-sm font-medium">{student.full_name}</p><p className="mt-1 text-[10px] text-faint">Última graduação: {formatDate(student.last_graduation_date)}</p></div><div><span className="inline-flex rounded-full bg-white/5 px-2.5 py-1 text-xs text-mist">{student.belt_name}</span></div><div className="text-xs text-mist">{degreeLabel(student.degree)}</div><div><p className="text-xs text-mist">{student.months_in_current_grade} / {student.min_months_required} meses</p><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, student.min_months_required ? student.months_in_current_grade / student.min_months_required * 100 : 100)}%` }}/></div></div><div><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${student.eligible ? "bg-emerald-500/10 text-emerald-300" : "bg-white/5 text-faint"}`}>{student.eligible ? "Apto" : "Em preparação"}</span></div><button onClick={() => openGraduation(student)} className="h-9 rounded-lg border border-hairline bg-obsidian px-3 text-xs font-medium text-mist hover:border-primary">Graduar</button></div>)}{!loading && !filtered.length && <div className="px-4 py-10 text-center text-sm text-faint">Nenhum aluno encontrado.</div>}</div>
    </section>
    <section className="mt-4 rounded-2xl border border-hairline bg-panel/70 p-4 sm:p-5"><div className="flex items-center gap-2"><CalendarDays className="size-4 text-accent-soft"/><div><h2 className="text-sm font-semibold">Histórico recente</h2><p className="text-[10px] uppercase tracking-[.15em] text-faint">Últimas graduações registradas</p></div></div><div className="mt-4 divide-y divide-hairline">{history.map(item => <div key={item.id} className="flex items-center gap-3 py-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-accent-soft"><Award className="size-4"/></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{item.student_name}</p><p className="mt-0.5 text-[10px] text-faint">{item.belt_name} · {degreeLabel(item.degree)} · {formatDate(item.graduation_date)}</p></div></div>)}{!history.length && <p className="py-6 text-center text-xs text-faint">Nenhuma graduação registrada ainda.</p>}</div></section>
    {selected && <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"><div className="w-full max-w-lg rounded-t-2xl border border-hairline bg-panel p-5 shadow-2xl sm:rounded-2xl"><div className="flex items-start justify-between"><div><p className="font-mono text-[9px] uppercase tracking-[.2em] text-faint">Nova graduação</p><h2 className="mt-1 text-lg font-semibold">{selected.full_name}</h2><p className="mt-1 text-xs text-faint">Atual: {selected.belt_name} · {degreeLabel(selected.degree)}</p></div><button onClick={() => setSelected(null)} className="text-faint hover:text-foreground"><X className="size-5"/></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs text-mist">Nova faixa<select value={form.belt_id} onChange={e => setForm(f => ({...f,belt_id:e.target.value}))} className="mt-1 h-10 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm outline-none focus:border-primary">{belts.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label><label className="text-xs text-mist">Grau<select value={form.degree} onChange={e => setForm(f => ({...f,degree:e.target.value}))} className="mt-1 h-10 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm outline-none focus:border-primary">{[0,1,2,3,4].map(d => <option key={d} value={d}>{degreeLabel(d)}</option>)}</select></label><label className="text-xs text-mist">Data<input type="date" value={form.graduation_date} onChange={e => setForm(f => ({...f,graduation_date:e.target.value}))} className="mt-1 h-10 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm outline-none focus:border-primary"/></label><label className="text-xs text-mist sm:col-span-2">Observação<textarea value={form.notes} onChange={e => setForm(f => ({...f,notes:e.target.value}))} rows={3} placeholder="Ex.: evolução técnica, comportamento, competição..." className="mt-1 w-full rounded-lg border border-hairline bg-obsidian px-3 py-2 text-sm outline-none focus:border-primary"/></label></div><button onClick={save} disabled={saving || !form.belt_id} className="mt-5 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Registrando..." : "Confirmar graduação"}</button></div></div>}
  </main></div>;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <article className="rounded-2xl border border-hairline bg-panel/70 p-4"><div className="flex items-center gap-2 text-faint">{icon}<span className="font-mono text-[9px] uppercase tracking-[.16em]">{label}</span></div><p className="mt-2 font-mono text-2xl font-semibold">{value}</p></article>; }
function UsersIcon() { return <span className="grid size-4 place-items-center rounded-full border border-current text-[8px]">●</span>; }

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, Check, ChevronDown, CircleDot, GraduationCap, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import instructorRafael from "@/assets/instructor-rafael.jpg";
import studentThiago from "@/assets/student-thiago.jpg";
import studentCamila from "@/assets/student-camila.jpg";
import studentBruno from "@/assets/student-bruno.jpg";
import studentHelena from "@/assets/student-helena.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel — Gestão FMP BJJ" },
      { name: "description", content: "Acompanhe alunos, aulas e resultados da sua academia em um só lugar." },
      { property: "og:title", content: "Painel — Gestão FMP BJJ" },
      { property: "og:description", content: "Acompanhe alunos, aulas e resultados da sua academia em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [notice, setNotice] = useState("");
  const classes = [
    ["18:30", "Jiu-Jitsu · Fundamentos", "Prof. Rafael · Tatame A", "18/24", true],
    ["19:30", "Muay Thai · Sparring", "Prof. Léo Santos · Ring", "9/12", false],
    ["20:30", "Judô · Competição", "Prof. Marina · Tatame B", "14/20", false],
    ["21:30", "Jiu-Jitsu · Avançado", "Prof. Rafael · Tatame A", "11/16", false],
  ] as const;
  const attendees = [
    [studentThiago, "Thiago Prado", "Jiu-Jitsu · Faixa azul", "07:04", true],
    [studentCamila, "Camila Rocha", "Muay Thai · Iniciante", "06:58", false],
    [studentBruno, "Bruno Alves", "Judô · Faixa marrom", "06:41", false],
    [studentHelena, "Helena Martins", "Jiu-Jitsu · Faixa roxa", "06:30", false],
  ] as const;

  return (
    <div className="min-h-screen bg-ink text-foreground dashboard-atmosphere">
      <div className="flex min-h-screen">
        <aside className="hidden w-[232px] shrink-0 border-r border-hairline bg-obsidian/80 md:flex md:flex-col">
          <div className="flex h-16 items-center gap-2.5 px-5">
            <div className="grid size-8 place-items-center rounded-[9px] bg-primary font-mono text-sm font-semibold text-primary-foreground">F</div>
            <div className="leading-none"><p className="text-[13px] font-semibold">FMP BJJ</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Tatame OS</p></div>
          </div>
          <nav className="px-3 text-[13px]">
            <p className="px-2 pb-2 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Operação</p>
            <a className="flex items-center gap-2.5 rounded-[10px] bg-primary/15 px-3 py-2 font-medium ring-1 ring-inset ring-primary/25"><CircleDot className="size-3 text-accent-soft" />Visão geral</a>
            {["Alunos", "Turmas & Aulas", "Financeiro", "Graduações"].map((item) => <a key={item} href="#" className="mt-0.5 flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-mist hover:bg-panel hover:text-foreground"><span className="size-1.5 rounded-full bg-hairline" />{item}</a>)}
            <p className="px-2 pb-2 pt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Disciplinas</p>
            {["Jiu-Jitsu", "Muay Thai", "Judô"].map((item, index) => <a key={item} href="#" className="mt-0.5 flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-mist hover:bg-panel hover:text-foreground"><span className={index === 0 ? "size-1.5 rounded-full bg-primary" : "size-1.5 rounded-full bg-faint"} />{item}</a>)}
          </nav>
          <div className="mt-auto border-t border-hairline p-3"><div className="flex items-center gap-3 rounded-[12px] bg-panel px-3 py-2.5 ring-1 ring-inset ring-white/5"><img src={instructorRafael} alt="Rafael Duarte" width={512} height={512} loading="lazy" className="size-9 rounded-full object-cover" /><div className="min-w-0 leading-tight"><p className="truncate text-[13px] font-medium">Rafael Duarte</p><p className="font-mono text-[10px] text-faint">Professor · Matriz</p></div></div></div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-hairline bg-obsidian/85 px-4 backdrop-blur-sm sm:px-6">
            <div className="leading-none"><h1 className="text-[15px] font-semibold">Visão geral</h1><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Seg, 07 Set · 14:57</p></div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2.5 rounded-full bg-panel px-3.5 py-2 ring-1 ring-inset ring-white/5 md:flex"><span className="size-1.5 rounded-full bg-accent-soft" /><span className="font-mono text-[11px] text-mist">Matriz · Vila Mariana</span></div><Button variant="panel" size="sm" onClick={() => setNotice("Nova aula pronta para ser criada.")}><CalendarPlus /> <span className="hidden sm:inline">Nova aula</span></Button><Button variant="action" size="sm" onClick={() => setNotice("Cadastro de aluno aberto.")}><Plus /> <span className="hidden sm:inline">Cadastrar aluno</span></Button></div>
          </header>
          <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
            {notice && <div role="status" className="mb-3 flex items-center justify-between rounded-[10px] border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-accent-soft"><span>{notice}</span><button aria-label="Fechar aviso" onClick={() => setNotice("")}><Check className="size-4" /></button></div>}
            <section aria-label="Indicadores principais" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[['Alunos ativos','+8','247','63% matriculados no ciclo atual'],['Aulas de hoje','6 / 8','6','Pico às 19h · turma de Jiu-Jitsu'],['Receita mensal','+12,4%','R$ 68.420','Projeção do trimestre: R$ 214k'],['Presença média','7 dias','82%','Muay Thai lidera com 91%']].map(([label, badge, value, text], index) => <article key={label} className="spec-surface rounded-[16px] bg-panel/70 p-5 ring-1 ring-inset ring-white/5"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">{label}</span><span className={index === 0 || index === 2 ? "rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-accent-soft" : "rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-mist"}>{badge}</span></div><p className="mt-3 font-mono text-3xl font-semibold tracking-normal">{value}</p><p className="mt-2 text-[12px] text-faint">{text}</p></article>)}
            </section>
            <section className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
              <article className="spec-surface rounded-[16px] bg-panel/70 p-5 ring-1 ring-inset ring-white/5 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="text-[15px] font-semibold">Agenda de treinos</h2><p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Hoje · 6 sessões programadas</p></div><Button variant="panel" size="sm">Semana <ChevronDown /></Button></div><div className="mt-4 divide-y divide-hairline">{classes.map(([time, title, teacher, count, active]) => <div key={time} className="flex items-center gap-4 py-3"><span className={active ? "w-12 shrink-0 font-mono text-[12px] text-accent-soft" : "w-12 shrink-0 font-mono text-[12px] text-mist"}>{time}</span><div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium">{title}</p><p className="mt-0.5 truncate font-mono text-[10px] text-faint">{teacher}</p></div><span className={active ? "shrink-0 rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] text-accent-soft" : "shrink-0 rounded-full bg-white/5 px-2.5 py-1 font-mono text-[10px] text-mist"}>{count}</span></div>)}</div></article>
              <article className="spec-surface rounded-[16px] bg-panel/70 p-5 ring-1 ring-inset ring-white/5"><h2 className="text-[15px] font-semibold">Presenças recentes</h2><p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-faint">Últimos check-ins</p><div className="mt-4 space-y-2.5">{attendees.map(([photo, name, discipline, time, active]) => <div key={name} className="flex items-center gap-3 rounded-[12px] bg-obsidian/70 px-3 py-2.5 ring-1 ring-inset ring-white/5"><img src={photo} alt={name} width={512} height={512} loading="lazy" className="size-9 shrink-0 rounded-full object-cover"/><div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[13px] font-medium">{name}</p><p className="font-mono text-[10px] text-faint">{discipline}</p></div><span className={active ? "shrink-0 font-mono text-[10px] text-accent-soft" : "shrink-0 font-mono text-[10px] text-mist"}>{time}</span></div>)}</div><Button variant="panel" className="mt-4 w-full" onClick={() => setNotice("Exibindo todas as presenças de hoje.")}><Users /> Ver todas as presenças</Button></article>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

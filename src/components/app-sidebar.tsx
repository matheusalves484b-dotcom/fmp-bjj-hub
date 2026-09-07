import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Award, CalendarDays, CircleDollarSign, LayoutDashboard, LogOut, Menu, ShieldAlert, UserCheck, Users, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

const staffItems = [
  { label: "Visão geral", to: "/", icon: LayoutDashboard },
  { label: "Alunos", to: "/alunos", icon: Users },
  { label: "Turmas & aulas", to: "/turmas", icon: CalendarDays },
  { label: "Frequência", to: "/frequencia", icon: UserCheck },
  { label: "Financeiro", to: "/financeiro", icon: CircleDollarSign },
  { label: "Graduações", to: "/graduacoes", icon: Award },
  { label: "Retenção", to: "/retencao", icon: ShieldAlert },
] as const;

const studentItems = [
  { label: "Meu espaço", to: "/", icon: LayoutDashboard },
  { label: "Minhas aulas", to: "/minhas-aulas", icon: CalendarDays },
] as const;

export function AppSidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isStudent = profile?.role === "STUDENT";
  const items = isStudent ? studentItems : staffItems;
  const roleLabel = { OWNER: "Proprietário", ADMIN: "Administrador", TEACHER: "Professor", STUDENT: "Aluno" }[profile?.role ?? "STUDENT"];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const sidebar = (
    <aside className="flex h-full w-[232px] flex-col border-r border-hairline bg-obsidian/95 shadow-2xl backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-hairline px-5">
        <Link to="/" className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-primary font-mono text-sm font-semibold text-primary-foreground" aria-label="Ir para o início">F</Link>
        <div className="min-w-0 flex-1 leading-none"><p className="text-[13px] font-semibold">FMP BJJ</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Tatame OS</p></div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal">
        <p className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[.2em] text-faint">{isStudent ? "Área do aluno" : "Operação"}</p>
        <div className="space-y-0.5">
          {items.map(({ label, to, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(`${to}/`));
            return <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ "aria-current": "page" }} className={`group flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors ${active ? "bg-primary/15 font-semibold text-foreground ring-1 ring-inset ring-primary/25" : "text-mist hover:bg-panel hover:text-foreground"}`}>
              <Icon className={`size-4 shrink-0 ${active ? "text-accent-soft" : "text-faint group-hover:text-mist"}`} />
              <span>{label}</span>
            </Link>;
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-hairline p-3">
        <div className="flex items-center gap-3 rounded-[12px] bg-panel px-3 py-2.5 ring-1 ring-inset ring-white/5">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-semibold text-accent-soft">{(profile?.full_name || "U").trim().charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[13px] font-medium">{profile?.full_name || "Usuário"}</p><p className="font-mono text-[10px] text-faint">{roleLabel}</p></div>
          <button onClick={logout} title="Sair" aria-label="Sair" className="grid size-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-foreground"><LogOut className="size-4" /></button>
        </div>
      </div>
    </aside>
  );

  return <>
    <div className="fixed inset-y-0 left-0 z-40 hidden md:block">{sidebar}</div>
    <button type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="fixed left-3 top-3 z-50 grid size-10 place-items-center rounded-xl border border-hairline bg-obsidian/95 text-foreground shadow-xl backdrop-blur md:hidden"><Menu className="size-5" /></button>
    {mobileOpen && <div className="fixed inset-0 z-[60] md:hidden">
      <button type="button" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative h-full w-[min(86vw,300px)]">{sidebar}<button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-panel text-mist"><X className="size-4" /></button></div>
    </div>}
  </>;
}

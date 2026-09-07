import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Award, CalendarDays, CircleDollarSign, LayoutDashboard, LogOut, Menu, PanelLeftClose, PanelLeftOpen, ShieldAlert, UserCheck, Users, X } from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("fmp-sidebar-collapsed") === "1");
  const isStudent = profile?.role === "STUDENT";
  const items = isStudent ? studentItems : staffItems;
  const roleLabel = { OWNER: "Proprietário", ADMIN: "Administrador", TEACHER: "Professor", STUDENT: "Aluno" }[profile?.role ?? "STUDENT"];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("fmp-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const sidebar = (
    <aside className={`flex h-full flex-col border-r border-hairline bg-obsidian/95 shadow-2xl backdrop-blur-xl transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[232px]"}`}>
      <div className={`flex h-16 shrink-0 items-center border-b border-hairline ${collapsed ? "justify-center px-2" : "gap-2.5 px-5"}`}>
        <Link to="/" className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-primary font-mono text-sm font-semibold text-primary-foreground" aria-label="Ir para o início">F</Link>
        {!collapsed && <div className="min-w-0 flex-1 leading-none"><p className="text-[13px] font-semibold">FMP BJJ</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">Tatame OS</p></div>}
        <button onClick={toggleCollapsed} className="hidden size-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-panel hover:text-foreground lg:grid" aria-label={collapsed ? "Expandir menu" : "Recolher menu"} title={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto px-3 py-4 ${collapsed ? "space-y-1" : ""}`} aria-label="Navegação principal">
        {!collapsed && <p className="px-2 pb-2 font-mono text-[9px] uppercase tracking-[.2em] text-faint">{isStudent ? "Área do aluno" : "Operação"}</p>}
        {items.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(`${to}/`));
          return <Link key={to} to={to} activeOptions={{ exact: to === "/" }} activeProps={{ "aria-current": "page" }} className={`group flex items-center rounded-[10px] text-[13px] transition-colors ${collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"} ${active ? "bg-primary/15 font-semibold text-foreground ring-1 ring-inset ring-primary/25" : "text-mist hover:bg-panel hover:text-foreground"}`} title={collapsed ? label : undefined}>
            <Icon className={`size-4 shrink-0 ${active ? "text-accent-soft" : "text-faint group-hover:text-mist"}`} />
            {!collapsed && <span>{label}</span>}
          </Link>;
        })}
      </nav>

      <div className="shrink-0 border-t border-hairline p-3">
        <div className={`flex items-center rounded-[12px] bg-panel ring-1 ring-inset ring-white/5 ${collapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"}`}>
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-semibold text-accent-soft">{(profile?.full_name || "U").trim().charAt(0).toUpperCase()}</div>
          {!collapsed && <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-[13px] font-medium">{profile?.full_name || "Usuário"}</p><p className="font-mono text-[10px] text-faint">{roleLabel}</p></div>}
          <button onClick={logout} title="Sair" aria-label="Sair" className="grid size-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-foreground"><LogOut className="size-4" /></button>
        </div>
      </div>
    </aside>
  );

  return <>
    <div className="fixed inset-y-0 left-0 z-40 hidden md:block">
      {sidebar}
    </div>
    <button type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="fixed left-3 top-3 z-50 grid size-10 place-items-center rounded-xl border border-hairline bg-obsidian/95 text-foreground shadow-xl backdrop-blur md:hidden">
      <Menu className="size-5" />
    </button>
    {mobileOpen && <div className="fixed inset-0 z-[60] md:hidden">
      <button type="button" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative h-full w-[min(86vw,300px)] animate-in slide-in-from-left duration-200">{sidebar}<button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-panel text-mist"><X className="size-4" /></button></div>
    </div>}
  </>;
}

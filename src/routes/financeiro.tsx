import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, Plus, RefreshCw, Search, TrendingUp, Users, X } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/financeiro")({ head: () => ({ meta: [{ title: "Financeiro — Gestão FMP BJJ" }] }), component: Financeiro });

type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELED";
type Invoice = { id:string; student_id:string; enrollment_id:string|null; amount:number; due_date:string; status:InvoiceStatus; payment_method:string|null; paid_at:string|null; description:string|null; profile?:{full_name:string}|null };
type Plan = { id:string; name:string; price:number; billing_cycle:string; active:boolean };

const brl = (n:number) => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
const monthLabel = (d:Date) => d.toLocaleDateString("pt-BR", { month:"long", year:"numeric" });
const isoMonth = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const statusLabel:Record<InvoiceStatus,string> = { PENDING:"Pendente", PAID:"Pago", OVERDUE:"Atrasado", CANCELED:"Cancelado" };

function Financeiro(){
  const { profile } = useAuth();
  const [month,setMonth] = useState(new Date());
  const [invoices,setInvoices] = useState<Invoice[]>([]);
  const [plans,setPlans] = useState<Plan[]>([]);
  const [search,setSearch] = useState("");
  const [status,setStatus] = useState<"ALL"|InvoiceStatus>("ALL");
  const [loading,setLoading] = useState(true);
  const [notice,setNotice] = useState("");
  const [showPlan,setShowPlan] = useState(false);
  const [planForm,setPlanForm] = useState({name:"",price:"",billing_cycle:"MONTHLY"});

  const load = async () => {
    setLoading(true);
    const start = `${isoMonth(month)}-01`;
    const next = new Date(month.getFullYear(),month.getMonth()+1,1);
    const end = `${isoMonth(next)}-01`;
    const [{data:inv,error:invError},{data:pl,error:plError}] = await Promise.all([
      supabase.from("invoices").select("id,student_id,enrollment_id,amount,due_date,status,payment_method,paid_at,description,profiles!invoices_student_id_fkey(full_name)").gte("due_date",start).lt("due_date",end).order("due_date",{ascending:true}),
      supabase.from("plans").select("id,name,price,billing_cycle,active").order("price",{ascending:true})
    ]);
    if(invError){ setNotice(invError.message); setInvoices([]); } else setInvoices((inv??[]).map((x:any)=>({...x,profile:Array.isArray(x.profiles)?x.profiles[0]??null:x.profiles})));
    if(plError) setNotice(plError.message); else setPlans(pl??[]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[month]);
  useEffect(()=>{ const channel=supabase.channel("financeiro-live").on("postgres_changes",{event:"*",schema:"public",table:"invoices"},()=>load()).subscribe(); return ()=>{supabase.removeChannel(channel);}; },[]);

  const visible = useMemo(()=>invoices.filter(i=>(status==="ALL"||i.status===status)&&((i.profile?.full_name??"").toLowerCase().includes(search.toLowerCase())||(i.description??"").toLowerCase().includes(search.toLowerCase()))),[invoices,status,search]);
  const metrics = useMemo(()=>{
    const paid=invoices.filter(i=>i.status==="PAID").reduce((s,i)=>s+Number(i.amount),0);
    const pending=invoices.filter(i=>i.status==="PENDING").reduce((s,i)=>s+Number(i.amount),0);
    const overdue=invoices.filter(i=>i.status==="OVERDUE"|| (i.status==="PENDING" && i.due_date < new Date().toISOString().slice(0,10))).reduce((s,i)=>s+Number(i.amount),0);
    const total=invoices.reduce((s,i)=>s+Number(i.amount),0);
    return {paid,pending,overdue,total,rate:total?Math.round(paid/total*100):0};
  },[invoices]);

  const setInvoiceStatus = async (id:string,next:InvoiceStatus) => {
    const {error}=await supabase.from("invoices").update({status:next,paid_at:next==="PAID"?new Date().toISOString():null}).eq("id",id);
    if(error) setNotice(error.message); else { setNotice(next==="PAID"?"Pagamento registrado com sucesso.":"Status da cobrança atualizado."); load(); }
  };
  const generate = async () => {
    const {data,error}=await supabase.rpc("generate_monthly_invoices",{target_month:isoMonth(month)+"-01"});
    if(error){setNotice(error.message);return;} setNotice(`${data??0} cobrança(s) gerada(s).`); load();
  };
  const createPlan = async (e:React.FormEvent) => { e.preventDefault(); const price=Number(planForm.price.replace(",",".")); if(!planForm.name||!price){setNotice("Informe nome e valor do plano.");return;} const {error}=await supabase.from("plans").insert({name:planForm.name,price,billing_cycle:planForm.billing_cycle,active:true}); if(error)setNotice(error.message);else{setShowPlan(false);setPlanForm({name:"",price:"",billing_cycle:"MONTHLY"});setNotice("Plano criado.");load();} };

  return <AuthGuard allowedRoles={["OWNER","ADMIN","TEACHER"]}><div className="min-h-screen bg-ink text-foreground"><main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-faint">Gestão financeira</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">Financeiro</h1><p className="mt-1 text-sm text-faint">Recebimentos, cobranças e inadimplência da academia.</p></div><div className="flex flex-wrap gap-2"><button onClick={()=>setShowPlan(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline bg-panel px-3 text-xs font-semibold hover:border-primary"><Plus className="size-4"/>Novo plano</button><button onClick={generate} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-110"><RefreshCw className="size-4"/>Gerar cobranças do mês</button></div></header>
    {notice&&<div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-xs text-accent-soft"><Check className="size-4"/>{notice}<button className="ml-auto" onClick={()=>setNotice("")}><X className="size-4"/></button></div>}
    <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric icon={<CircleDollarSign/>} label="Recebido" value={brl(metrics.paid)} sub={`${metrics.rate}% do mês`} /><Metric icon={<TrendingUp/>} label="A receber" value={brl(metrics.pending)} sub="Cobranças pendentes" /><Metric icon={<AlertCircle/>} label="Inadimplência" value={brl(metrics.overdue)} sub="Em atraso" danger={metrics.overdue>0}/><Metric icon={<Users/>} label="Cobranças" value={String(invoices.length)} sub={`${invoices.filter(i=>i.status==="PAID").length} pagas`} /></div>
    <section className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]"><div className="spec-surface overflow-hidden rounded-2xl bg-panel/70 ring-1 ring-inset ring-white/5"><div className="flex flex-col gap-3 border-b border-hairline p-4 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="grid size-9 place-items-center rounded-lg border border-hairline bg-obsidian hover:border-primary"><ChevronLeft className="size-4"/></button><div className="min-w-[150px] text-center font-medium capitalize">{monthLabel(month)}</div><button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="grid size-9 place-items-center rounded-lg border border-hairline bg-obsidian hover:border-primary"><ChevronRight className="size-4"/></button></div><div className="flex flex-1 gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aluno..." className="h-9 w-full rounded-lg border border-hairline bg-obsidian pl-9 pr-3 text-xs outline-none focus:border-primary"/></div><select value={status} onChange={e=>setStatus(e.target.value as any)} className="h-9 rounded-lg border border-hairline bg-obsidian px-3 text-xs"><option value="ALL">Todos</option><option value="PAID">Pagos</option><option value="PENDING">Pendentes</option><option value="OVERDUE">Atrasados</option><option value="CANCELED">Cancelados</option></select></div></div>
      {loading?<div className="p-10 text-center text-sm text-faint">Carregando financeiro...</div>:visible.length===0?<div className="p-12 text-center"><CreditCard className="mx-auto size-8 text-faint"/><p className="mt-3 text-sm font-medium">Nenhuma cobrança encontrada</p><p className="mt-1 text-xs text-faint">Gere as cobranças do mês ou ajuste os filtros.</p></div>:<div className="divide-y divide-hairline">{visible.map(i=><InvoiceRow key={i.id} invoice={i} onStatus={setInvoiceStatus}/>)}</div>}
    </div><aside className="spec-surface rounded-2xl bg-panel/70 p-5 ring-1 ring-inset ring-white/5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Planos ativos</h2><p className="mt-1 font-mono text-[9px] uppercase tracking-[.16em] text-faint">Mensalidades</p></div><CreditCard className="size-4 text-faint"/></div><div className="mt-4 space-y-2">{plans.filter(p=>p.active).map(p=><div key={p.id} className="rounded-xl bg-obsidian/70 p-3 ring-1 ring-inset ring-white/5"><div className="flex justify-between gap-3"><span className="text-xs font-medium">{p.name}</span><span className="font-mono text-xs text-accent-soft">{brl(Number(p.price))}</span></div><p className="mt-1 text-[10px] text-faint">{p.billing_cycle==="MONTHLY"?"Mensal":p.billing_cycle}</p></div>)}{plans.filter(p=>p.active).length===0&&<p className="text-xs text-faint">Nenhum plano ativo.</p>}</div></aside></section>
    {showPlan&&<div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={e=>e.currentTarget===e.target&&setShowPlan(false)}><form onSubmit={createPlan} className="w-full max-w-md rounded-2xl border border-hairline bg-panel p-5 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Novo plano</h2><p className="mt-1 text-xs text-faint">Cadastre a mensalidade da academia.</p></div><button type="button" onClick={()=>setShowPlan(false)}><X/></button></div><div className="mt-5 space-y-3"><input required value={planForm.name} onChange={e=>setPlanForm({...planForm,name:e.target.value})} placeholder="Ex.: Plano Mensal" className="h-11 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm outline-none focus:border-primary"/><input required value={planForm.price} onChange={e=>setPlanForm({...planForm,price:e.target.value})} placeholder="Valor (ex.: 149,90)" className="h-11 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm outline-none focus:border-primary"/><select value={planForm.billing_cycle} onChange={e=>setPlanForm({...planForm,billing_cycle:e.target.value})} className="h-11 w-full rounded-lg border border-hairline bg-obsidian px-3 text-sm"><option value="MONTHLY">Mensal</option><option value="QUARTERLY">Trimestral</option><option value="YEARLY">Anual</option></select></div><button className="mt-5 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground">Criar plano</button></form></div>}
  </main></div></AuthGuard>
}
function Metric({icon,label,value,sub,danger=false}:{icon:React.ReactNode;label:string;value:string;sub:string;danger?:boolean}){return <article className="spec-surface rounded-2xl bg-panel/70 p-4 ring-1 ring-inset ring-white/5"><div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase tracking-[.17em] text-faint">{label}</span><span className={danger?"text-red-300":"text-accent-soft"}>{icon}</span></div><p className="mt-3 truncate font-mono text-xl font-semibold sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-faint">{sub}</p></article>}
function InvoiceRow({invoice,onStatus}:{invoice:Invoice;onStatus:(id:string,s:InvoiceStatus)=>void}){const overdue=invoice.status==="OVERDUE"||(invoice.status==="PENDING"&&invoice.due_date<new Date().toISOString().slice(0,10)); const actual=overdue&&invoice.status==="PENDING"?"OVERDUE":invoice.status; return <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-accent-soft"><CircleDollarSign className="size-4"/></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{invoice.profile?.full_name??"Aluno"}</p><p className="mt-0.5 text-[10px] text-faint">Vencimento {new Date(invoice.due_date+"T12:00:00").toLocaleDateString("pt-BR")} {invoice.description?`· ${invoice.description}`:""}</p></div><div className="flex items-center gap-3 sm:justify-end"><div className="text-right"><p className="font-mono text-sm font-semibold">{brl(Number(invoice.amount))}</p><span className={`text-[10px] ${actual==="PAID"?"text-emerald-300":actual==="OVERDUE"?"text-red-300":"text-amber-300"}`}>{statusLabel[actual]}</span></div>{actual!=="PAID"&&actual!=="CANCELED"&&<button onClick={()=>onStatus(invoice.id,"PAID")} className="grid size-9 place-items-center rounded-lg border border-hairline bg-obsidian hover:border-primary" title="Marcar como pago"><Check className="size-4"/></button>}</div></div>}

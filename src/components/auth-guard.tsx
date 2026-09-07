import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import type { AppRole, Profile } from "@/lib/auth";

export function AuthGuard({ children, allowedRoles }: { children: ReactNode; allowedRoles?: AppRole[] }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuthenticated(Boolean(sessionData.session));

      if (sessionData.session) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, role, phone, avatar_url")
          .eq("id", sessionData.session.user.id)
          .single();
        if (mounted) setProfile(data as Profile | null);
      } else {
        setProfile(null);
      }
      if (mounted) setLoading(false);
    };

    load();
    const { data } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div className="grid min-h-screen place-items-center bg-ink text-mist"><div className="size-7 animate-spin rounded-full border-2 border-hairline border-t-primary" /></div>;
  if (!authenticated) return <Navigate to="/login" search={{ redirect: location.pathname }} replace />;
  if (!profile) return <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-mist"><div><p className="font-semibold text-foreground">Perfil ainda não disponível</p><p className="mt-2 text-sm">Atualize a página para sincronizar seu acesso.</p></div></div>;
  if (allowedRoles && !allowedRoles.includes(profile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { loadProfile, type AppRole, type Profile } from "@/lib/auth";

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

      if (!sessionData.session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextProfile = await loadProfile(sessionData.session.user.id);
      if (!mounted) return;

      setProfile(nextProfile);
      setLoading(false);
    };

    void load();

    const { data } = supabase.auth.onAuthStateChange(() => {
      // Keep the Auth callback synchronous and let the profile query run outside
      // the Auth client's internal callback/lock.
      setTimeout(() => {
        void load();
      }, 0);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-ink text-mist"><div className="size-7 animate-spin rounded-full border-2 border-hairline border-t-primary" /></div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" search={{ redirect: location.pathname }} replace />;
  }

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink px-6 text-center text-mist">
        <div className="max-w-md">
          <p className="font-semibold text-foreground">Perfil ainda não disponível</p>
          <p className="mt-2 text-sm leading-6">Sua autenticação foi reconhecida, mas o perfil da academia ainda não foi sincronizado. Saia e entre novamente após a sincronização.</p>
          <button
            type="button"
            onClick={() => { void supabase.auth.signOut(); }}
            className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            Sair e entrar novamente
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type AppRole = "OWNER" | "ADMIN" | "TEACHER" | "STUDENT";

export type Profile = {
  id: string;
  full_name: string;
  role: AppRole;
  phone: string | null;
  avatar_url: string | null;
};

const PROFILE_RETRY_DELAYS = [0, 250, 500, 1000, 1500, 2500];

export async function loadProfile(userId: string): Promise<Profile | null> {
  for (let attempt = 0; attempt < PROFILE_RETRY_DELAYS.length; attempt += 1) {
    const delay = PROFILE_RETRY_DELAYS[attempt];
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, phone, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (data) return data as Profile;

    if (error && error.code !== "PGRST116") {
      console.warn("Não foi possível carregar o perfil do usuário:", error.message);
    }
  }

  return null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nextProfile = await loadProfile(nextSession.user.id);
      if (!active) return;

      setProfile(nextProfile);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Supabase recommends keeping this callback synchronous. Defer the database
      // query so it does not compete with the Auth client's internal lock.
      setTimeout(() => {
        void syncSession(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, profile, loading, isAuthenticated: Boolean(session) };
}

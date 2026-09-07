import { createClient } from "@supabase/supabase-js";

// Configuração direta para permitir que o app funcione no Lovable
// mesmo sem acesso aos Build Secrets.
// A publishable key é própria para uso no navegador e deve continuar
// protegida pelas políticas RLS do Supabase.
const SUPABASE_URL = "https://mgbfvznmgbfoddymvogt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T3VQGY4ZPuZkxjtPrnCgYQ_r98tRg1I";

const EXPECTED_SUPABASE_PROJECT_REF = "mgbfvznmgbfoddymvogt";

function validateSupabaseUrl(url: string) {
  const hostname = new URL(url).hostname;
  const match = hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
  const projectRef = match?.[1] ?? null;

  if (projectRef !== EXPECTED_SUPABASE_PROJECT_REF) {
    throw new Error(
      `Ambiente Supabase incorreto. O Gestão FMP BJJ deve usar o projeto ${EXPECTED_SUPABASE_PROJECT_REF}.`,
    );
  }
}

validateSupabaseUrl(SUPABASE_URL);

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

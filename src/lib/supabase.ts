import { createClient } from "@supabase/supabase-js";

// Configuração direta para o build do Lovable, sem depender dos Build Secrets.
// Esta é uma publishable key, própria para uso no navegador. A proteção dos dados
// continua sendo feita pelas políticas RLS do projeto Supabase.
export const SUPABASE_URL = "https://mgbfvznmgbfoddymvogt.supabase.co";
export const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_T3VQGY4ZPuZkxjtPrnCgYQ_r98tRg1I";

const EXPECTED_SUPABASE_PROJECT_REF = "mgbfvznmgbfoddymvogt";

function validateSupabaseUrl(url: string) {
  const hostname = new URL(url).hostname;
  const match = hostname.match(/^([a-z0-9]+)\.supabase\.co$/i);
  const projectRef = match?.[1] ?? null;

  if (projectRef !== EXPECTED_SUPABASE_PROJECT_REF) {
    throw new Error(`Ambiente Supabase incorreto. O Gestão FMP BJJ deve usar o projeto ${EXPECTED_SUPABASE_PROJECT_REF}.`);
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

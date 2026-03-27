export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

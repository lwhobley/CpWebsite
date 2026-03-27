import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}

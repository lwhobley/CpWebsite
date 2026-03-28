import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  const supabase = await createServerSupabaseClient();
  if (!supabase || !tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=auth_callback_unavailable", request.url));
  }

  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: type as "magiclink",
  });

  if (otpError) {
    return NextResponse.redirect(new URL("/login?error=magic_link_invalid", request.url));
  }

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser?.email) {
    return NextResponse.redirect(new URL("/login?error=profile_lookup_failed", request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, name, role, location_id, email, active")
    .eq("email", authUser.email)
    .maybeSingle();

  if (profileError || !profile?.active) {
    return NextResponse.redirect(new URL("/login?error=profile_lookup_failed", request.url));
  }

  await createSession({
    id: profile.id,
    name: profile.name,
    role: profile.role,
    locationId: profile.location_id,
    email: profile.email,
    active: profile.active,
  });

  return NextResponse.redirect(new URL(next, request.url));
}

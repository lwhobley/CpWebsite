import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { APP_URL, LOCATION_ID } from "@/lib/constants";
import { mockUsers } from "@/lib/data/mock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${APP_URL}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: "Magic link sent." });
  }

  const user = mockUsers.find((item) => item.role === "manager");
  await createSession({
    id: user?.id ?? "manager-preview",
    name: user?.name ?? "Preview Manager",
    role: user?.role ?? "manager",
    locationId: user?.locationId ?? LOCATION_ID,
    email,
    active: true,
  });

  return NextResponse.json({
    ok: true,
    redirectTo: "/dashboard",
    message: "Supabase env vars are missing, so a local manager session was created for preview.",
  });
}

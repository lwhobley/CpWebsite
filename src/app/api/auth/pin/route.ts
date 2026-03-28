import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { userId, name, pin } = (await request.json()) as {
    userId?: string;
    name?: string;
    pin?: string;
  };
  const trimmedName = name?.trim();

  if ((!userId && !trimmedName) || !pin || pin.length !== 4) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "PIN sign-in is unavailable because Supabase is not configured." },
      { status: 503 },
    );
  }

  let query = supabase
    .from("users")
    .select("id, name, role, location_id, email, active, pin_hash")
    .limit(1);

  if (userId) {
    query = query.eq("id", userId);
  } else if (trimmedName) {
    query = query.ilike("name", trimmedName);
  }

  const { data: user, error } = await query.maybeSingle();

  if (error) {
    return NextResponse.json({ error: "PIN sign-in is temporarily unavailable." }, { status: 503 });
  }

  if (!user?.active || !user.pin_hash || !(await bcrypt.compare(pin, user.pin_hash))) {
    return NextResponse.json({ error: "PIN was not recognized." }, { status: 401 });
  }

  await createSession({
    id: user.id,
    name: user.name,
    role: user.role,
    locationId: user.location_id,
    email: user.email,
    active: user.active,
  });

  return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
}

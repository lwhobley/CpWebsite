import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { mockUsers } from "@/lib/data/mock";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { userId, pin } = (await request.json()) as { userId?: string; pin?: string };

  if (!userId || !pin || pin.length !== 4) {
    return NextResponse.json({ error: "Invalid login payload." }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  if (supabase) {
    const { data: user } = await supabase
      .from("users")
      .select("id, name, role, location_id, email, active, pin_hash")
      .eq("id", userId)
      .single();

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

  const localUser = mockUsers.find((user) => user.id === userId);
  if (!localUser?.active || !(await bcrypt.compare(pin, localUser.pinHash))) {
    return NextResponse.json({ error: "PIN was not recognized." }, { status: 401 });
  }

  await createSession({
    id: localUser.id,
    name: localUser.name,
    role: localUser.role,
    locationId: localUser.locationId,
    email: localUser.email,
    active: localUser.active,
  });

  return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
}

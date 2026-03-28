import { NextRequest, NextResponse } from "next/server";
import { FLOOR_ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/data/get-current-user";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const prefix = request.nextUrl.searchParams.get("prefix")?.trim().toLowerCase() ?? "";

  if (prefix.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const supabase = createAdminSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Staff lookup is unavailable." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, role")
    .eq("active", true)
    .in("role", FLOOR_ROLES)
    .ilike("name", `${prefix}%`)
    .limit(6);

  if (error) {
    return NextResponse.json({ error: "Staff lookup failed." }, { status: 503 });
  }

  return NextResponse.json({ users: data ?? [] });
}

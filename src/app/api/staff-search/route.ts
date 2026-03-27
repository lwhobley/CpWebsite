import { NextRequest, NextResponse } from "next/server";
import { FLOOR_ROLES } from "@/lib/constants";
import { mockUsers } from "@/lib/data/mock";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const prefix = request.nextUrl.searchParams.get("prefix")?.trim().toLowerCase() ?? "";

  if (prefix.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const supabase = createAdminSupabaseClient();
  if (supabase) {
    const { data } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("active", true)
      .in("role", FLOOR_ROLES)
      .ilike("name", `${prefix}%`)
      .limit(6);

    return NextResponse.json({ users: data ?? [] });
  }

  const users = mockUsers
    .filter((user) => FLOOR_ROLES.includes(user.role) && user.name.toLowerCase().includes(prefix))
    .map(({ id, name, role }) => ({ id, name, role }));

  return NextResponse.json({ users });
}

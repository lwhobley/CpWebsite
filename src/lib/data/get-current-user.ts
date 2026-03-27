import { getSessionUser } from "@/lib/auth/session";
import { mockUsers } from "@/lib/data/mock";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const sessionUser = await getSessionUser();
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      const { data: profile } = await supabase
        .from("users")
        .select("id, name, role, location_id, email, active")
        .eq("email", authUser.email)
        .single();

      if (profile) {
        return {
          id: profile.id,
          name: profile.name,
          role: profile.role,
          locationId: profile.location_id,
          email: profile.email,
          active: profile.active,
        };
      }
    }
  }

  if (sessionUser) {
    return sessionUser;
  }

  return null;
}

export function getMockUserById(id: string) {
  return mockUsers.find((user) => user.id === id) ?? null;
}

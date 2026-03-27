import { redirect } from "next/navigation";
import { ADMIN_ROLES, MANAGER_ROLES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/data/get-current-user";

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireManager() {
  const user = await requireUser();
  if (!MANAGER_ROLES.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!ADMIN_ROLES.includes(user.role)) {
    redirect("/dashboard");
  }
  return user;
}

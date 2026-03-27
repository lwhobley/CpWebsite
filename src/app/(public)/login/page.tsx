import { redirect } from "next/navigation";
import { LoginCard } from "@/components/login/login-card";
import { getCurrentUser } from "@/lib/data/get-current-user";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <LoginCard />
    </main>
  );
}

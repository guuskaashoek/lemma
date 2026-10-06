import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/session";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/learn");
  return <LoginForm />;
}

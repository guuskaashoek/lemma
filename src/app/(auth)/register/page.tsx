import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/session";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/learn");
  return <RegisterForm />;
}

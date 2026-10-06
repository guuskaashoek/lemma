/**
 * Centered, minimal layout for login, register and password reset.
 */
import Link from "next/link";
import { LanguageSwitch } from "@/components/language-switch";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Lemma
        </Link>
        <LanguageSwitch />
      </div>
      {children}
    </main>
  );
}

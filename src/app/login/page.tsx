import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <LoginForm />
      <Link
        href="/signup"
        className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        광고주이신가요? 회원가입
      </Link>
    </main>
  );
}

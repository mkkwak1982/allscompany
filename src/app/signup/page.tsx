import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignupForm } from "./SignupForm";

export default async function SignupPage() {
  const salesReps = await prisma.user.findMany({
    where: { role: "SALES" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true },
  });

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <SignupForm salesReps={salesReps} />
      <Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
        이미 계정이 있으신가요? 로그인
      </Link>
    </main>
  );
}

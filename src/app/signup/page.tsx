import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SignupForm } from "./SignupForm";

// 영업자 목록은 자주 바뀌므로 정적 캐싱하지 않고 매 요청마다 새로 조회한다
export const dynamic = "force-dynamic";

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

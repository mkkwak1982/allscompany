import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NewSalesForm } from "./NewSalesForm";
import { ResetPasswordInline } from "./ResetPasswordInline";

export default async function AdminSalesPage() {
  await requireRole("ADMIN");

  const reps = await prisma.user.findMany({
    where: { role: "SALES" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { advertisersManaged: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">영업자 계정 관리</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          영업자 계정을 생성하면 발급된 아이디/비밀번호를 해당 영업자에게 전달해주세요.
        </p>
      </div>

      <NewSalesForm />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">아이디</th>
              <th className="px-4 py-3 font-medium">담당 광고주 수</th>
              <th className="px-4 py-3 font-medium">비밀번호</th>
            </tr>
          </thead>
          <tbody>
            {reps.map((rep) => (
              <tr key={rep.id} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{rep.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{rep.username}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  <Link href={`/admin/dashboard?view=byrep&rep=${rep.id}`} className="hover:underline">
                    {rep._count.advertisersManaged}곳 보기
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <ResetPasswordInline userId={rep.id} currentPassword={rep.passwordPlain ?? ""} />
                </td>
              </tr>
            ))}
            {reps.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  등록된 영업자가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

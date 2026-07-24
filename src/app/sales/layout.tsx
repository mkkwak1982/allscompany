import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/actions";

export default async function SalesLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("SALES");

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-50">올스컴퍼니</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{session.name}님 (영업자)</p>
            </div>
            <nav className="hidden gap-4 text-sm font-medium text-slate-500 sm:flex dark:text-slate-400">
              <Link href="/sales/dashboard" className="hover:text-slate-900 dark:hover:text-slate-100">
                대시보드
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              로그아웃
            </button>
          </form>
        </div>
        <nav className="flex gap-4 border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-500 sm:hidden dark:border-slate-800 dark:text-slate-400">
          <Link href="/sales/dashboard">대시보드</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

import { requireRole } from "@/lib/auth";
import { logoutAction } from "@/app/actions";

export default async function AdvertiserLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ADVERTISER");

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">올스컴퍼니</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{session.name}님 (광고주)</p>
          </div>
          <form action={logoutAction}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              로그아웃
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryLabel } from "@/lib/catalog";
import { saveRatesAction } from "./actions";

export default async function AdminRatesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("ADMIN");
  const { saved } = await searchParams;

  const rates = await prisma.capitalRate.findMany({ orderBy: { categoryKey: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">한국캐피탈 금리</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          품목별 적용 캐피탈 금리(연, %)를 관리합니다. 금융 미지원 품목(가정용 초음파세척기,
          수압식세척기)은 표시되지 않습니다.
        </p>
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          저장되었습니다.
        </p>
      )}

      <form
        action={saveRatesAction}
        className="max-w-lg space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        {rates.map((r) => (
          <div key={r.categoryKey} className="flex items-center justify-between gap-4">
            <label className="text-sm text-slate-700 dark:text-slate-300">
              {categoryLabel(r.categoryKey)}
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.1"
                name={`rate__${r.categoryKey}`}
                defaultValue={Math.round(r.rate * 1000) / 10}
                className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>
        ))}
        <button
          type="submit"
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
        >
          저장
        </button>
      </form>
    </div>
  );
}

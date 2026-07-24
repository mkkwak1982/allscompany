import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAY_TIERS, payTierLabel } from "@/lib/catalog";
import { formatWon } from "@/lib/format";
import {
  saveCardFeeTiersAction,
  savePgDeductionTiersAction,
  saveGradeThresholdsAction,
  saveSettingsAction,
} from "./actions";

const GRADE_ORDER = ["일반", "중소3", "중소2", "중소1", "영세"];

export default async function AdminFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("ADMIN");
  const { saved } = await searchParams;

  const [cardFeeTiers, pgDeductionTiers, gradeThresholds, settings] = await Promise.all([
    prisma.cardFeeTier.findMany(),
    prisma.pgDeductionTier.findMany(),
    prisma.gradeThreshold.findMany(),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">수수료 관리</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          계약서 수수료, PG 차감수수료, 매출구간 기준, VAN 수수료율을 관리합니다.
        </p>
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          저장되었습니다.
        </p>
      )}

      <section
        id="card-fee"
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          계약서 수수료 (페이 x 매출구간)
        </h2>
        <form action={saveCardFeeTiersAction}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 pr-3 text-left font-medium text-slate-500 dark:text-slate-400">
                    매출구간 \ 페이
                  </th>
                  {PAY_TIERS.map((tier) => (
                    <th key={tier} className="py-2 pr-3 text-left font-medium text-slate-500 dark:text-slate-400">
                      {payTierLabel(tier)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRADE_ORDER.map((grade) => (
                  <tr key={grade} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2 pr-3 font-medium text-slate-700 dark:text-slate-300">{grade}</td>
                    {PAY_TIERS.map((tier) => {
                      const t = cardFeeTiers.find((c) => c.payTier === tier && c.grade === grade);
                      return (
                        <td key={tier} className="py-2 pr-3">
                          <input
                            type="number"
                            step="0.01"
                            name={`fee__${tier}__${grade}`}
                            defaultValue={t ? Math.round(t.feeRate * 10000) / 100 : 0}
                            className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            계약서 수수료 저장
          </button>
        </form>
      </section>

      <section
        id="pg-deduction"
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          PG 차감수수료 (D+1 기준)
        </h2>
        <form action={savePgDeductionTiersAction} className="max-w-sm space-y-3">
          {GRADE_ORDER.map((grade) => {
            const t = pgDeductionTiers.find((p) => p.grade === grade);
            return (
              <div key={grade} className="flex items-center justify-between gap-4">
                <label className="text-sm text-slate-700 dark:text-slate-300">{grade}</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    name={`pg__${grade}`}
                    defaultValue={t ? Math.round(t.rate * 10000) / 100 : 0}
                    className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span className="text-slate-400">%</span>
                </div>
              </div>
            );
          })}
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            PG 차감수수료 저장
          </button>
        </form>
      </section>

      <section
        id="grade-threshold"
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          매출구간 기준 (연매출 하한액)
        </h2>
        <form action={saveGradeThresholdsAction} className="max-w-sm space-y-3">
          {GRADE_ORDER.map((grade) => {
            const t = gradeThresholds.find((g) => g.grade === grade);
            return (
              <div key={grade} className="flex items-center justify-between gap-4">
                <label className="text-sm text-slate-700 dark:text-slate-300">{grade}</label>
                <input
                  type="number"
                  step="10000000"
                  name={`threshold__${grade}`}
                  defaultValue={t?.minAnnualRevenue ?? 0}
                  className="w-40 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            );
          })}
          <p className="text-xs text-slate-400">
            현재 기준: {gradeThresholds.map((g) => `${g.grade} ${formatWon(g.minAnnualRevenue)}원 이상`).join(" · ")}
          </p>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            매출구간 기준 저장
          </button>
        </form>
      </section>

      <section
        id="settings"
        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          VAN 수수료율 / 지원기간
        </h2>
        <form action={saveSettingsAction} className="max-w-sm space-y-3">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-slate-700 dark:text-slate-300">VAN 수수료율</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.01"
                name="vanFeeRate"
                defaultValue={settings ? Math.round(settings.vanFeeRate * 10000) / 100 : 1.2}
                className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm text-slate-700 dark:text-slate-300">지원기간(개월)</label>
            <input
              type="number"
              name="supportMonths"
              defaultValue={settings?.supportMonths ?? 48}
              className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            저장
          </button>
        </form>
      </section>
    </div>
  );
}

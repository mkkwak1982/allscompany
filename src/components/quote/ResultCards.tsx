import { formatPercent, formatWon } from "@/lib/format";
import { payTierLabel } from "@/lib/catalog";
import type { PromiseSectionResult, FeeSectionResult } from "@/lib/calc";

export function ResultCards({
  variant,
  promise,
  fee,
  totalSalesProfit,
  totalRevenueProfit,
}: {
  variant: "advertiser" | "internal";
  promise: PromiseSectionResult;
  fee: FeeSectionResult;
  totalSalesProfit: number;
  totalRevenueProfit: number;
}) {
  if (variant === "advertiser") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">지원 결과</h2>
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-center text-lg font-bold ${
            promise.feasible
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          }`}
        >
          매출약속 기반 지원 {promise.feasible ? "가능" : "불가능"}
        </div>
        <dl className="space-y-2 text-sm">
          <Row label="매출 구분" value={fee.grade} />
          <Row label="확정 수수료율" value={formatPercent(fee.confirmedFeeRate, 2)} />
          <Row label="매월 지원금" value={`${formatWon(fee.monthlySupportTotal)}원`} emphasize />
        </dl>
      </section>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          매출약속 기반 지원가능 여부
        </h2>
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-center text-lg font-bold ${
            promise.feasible
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          }`}
        >
          {promise.feasible ? "가능" : "불가능"}
        </div>
        <dl className="space-y-2 text-sm">
          <Row label="매출약속액 (월)" value={`${formatWon(promise.promisedMonthlyRevenue)}원`} />
          <Row label="매출약속액 (연)" value={`${formatWon(promise.promisedAnnualRevenue)}원`} />
          <Row label="페이" value={payTierLabel(promise.payTier)} />
          <Row label="납품기자재 총액" value={`${formatWon(promise.suppliedTotalExVat)}원`} />
          <Row label="총액 X 페이 (필요 최소 매출)" value={`${formatWon(promise.requiredMinimum)}원`} />
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          PG수수료 및 지원금
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="매출 구분" value={fee.grade} />
          <Row label="확정 수수료율" value={formatPercent(fee.confirmedFeeRate, 2)} />
          <Row label="매월 수수료" value={`${formatWon(fee.monthlyFee)}원`} />
          <Row label="매월 지원금" value={`${formatWon(fee.monthlySupportTotal)}원`} />
          <Row label="PG 차감수수료율" value={formatPercent(fee.pgDeductionRate, 2)} />
          <Row label="PG차감액" value={`${formatWon(fee.pgDeductionAmount)}원`} />
          <Row label="매월 이익" value={`${formatWon(fee.monthlyProfit)}원`} emphasize />
        </dl>

        <hr className="my-4 border-slate-200 dark:border-slate-800" />
        <dl className="space-y-2 text-sm">
          <Row label="판매이익" value={`${formatWon(totalSalesProfit)}원`} />
          <Row label="총 매출 이익" value={`${formatWon(totalRevenueProfit)}원`} emphasize />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd
        className={
          emphasize
            ? "font-bold text-slate-900 dark:text-slate-50"
            : "text-slate-700 dark:text-slate-300"
        }
      >
        {value}
      </dd>
    </div>
  );
}

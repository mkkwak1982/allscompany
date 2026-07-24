import { formatPercent, formatWon } from "@/lib/format";
import type { CategoryGroupFormData, LineItemFormData } from "./types";

/** 영업자/관리자용 읽기 전용 견적 뷰 (계약 내용은 광고주 모드에서만 입력) */
export function QuoteView({ groups }: { groups: CategoryGroupFormData[] }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.categoryKey}
          className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
            {group.categoryLabel}
          </h2>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-3 font-medium">품목</th>
                  <th className="py-2 pr-3 font-medium">수량</th>
                  <th className="py-2 pr-3 font-medium">할인율</th>
                  <th className="py-2 pr-3 font-medium">총액</th>
                  <th className="py-2 pr-3 font-medium">최종총액(VAT제외)</th>
                  <th className="py-2 pr-3 font-medium">VAT포함</th>
                  {group.items[0]?.hasFinancing && (
                    <>
                      <th className="py-2 pr-3 font-medium">캐피탈금리</th>
                      <th className="py-2 pr-3 font-medium">월지원금(VAT제외)</th>
                    </>
                  )}
                  <th className="py-2 pr-3 font-medium">공급가</th>
                  <th className="py-2 pr-3 font-medium">판매이익</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/60">
                    <td className="py-2 pr-3 align-top">
                      <span className="text-slate-700 dark:text-slate-300">{item.productLabel}</span>
                      <div className="mt-0.5 text-xs text-slate-400">{item.slotLabel}</div>
                    </td>
                    <td className="py-2 pr-3 align-top">{item.quantity}</td>
                    <td className="py-2 pr-3 align-top">{formatPercent(item.discountRate, 0)}</td>
                    <td className="py-2 pr-3 align-top whitespace-nowrap">
                      {formatWon(item.retailPrice * item.quantity)}
                    </td>
                    <td className="py-2 pr-3 align-top whitespace-nowrap">{formatWon(item.finalExVat)}</td>
                    <td className="py-2 pr-3 align-top whitespace-nowrap">{formatWon(item.finalIncVat)}</td>
                    {item.hasFinancing && (
                      <>
                        <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {item.capitalRatePercent !== null ? formatPercent(item.capitalRatePercent) : "-"}
                        </td>
                        <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {item.monthlySupportExVat !== null ? formatWon(item.monthlySupportExVat) : "-"}
                        </td>
                      </>
                    )}
                    <td className="py-2 pr-3 align-top whitespace-nowrap text-amber-700 dark:text-amber-500">
                      {item.supplyPrice !== null ? formatWon(item.supplyPrice) : "-"}
                    </td>
                    <td className="py-2 pr-3 align-top whitespace-nowrap font-medium text-amber-700 dark:text-amber-500">
                      {item.profit !== null ? formatWon(item.profit) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {group.items.map((item) => (
              <MobileItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MobileItemCard({ item }: { item: LineItemFormData }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-slate-800 dark:text-slate-200">{item.productLabel}</span>
        <span className="text-xs text-slate-400">{item.slotLabel}</span>
      </div>
      <dl className="grid grid-cols-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <dt>수량</dt>
        <dd className="text-right">{item.quantity}</dd>
        <dt>할인율</dt>
        <dd className="text-right">{formatPercent(item.discountRate, 0)}</dd>
        <dt>총액</dt>
        <dd className="text-right">{formatWon(item.retailPrice * item.quantity)}</dd>
        <dt>최종총액(VAT제외)</dt>
        <dd className="text-right">{formatWon(item.finalExVat)}</dd>
        <dt>VAT포함</dt>
        <dd className="text-right">{formatWon(item.finalIncVat)}</dd>
        {item.hasFinancing && (
          <>
            <dt>캐피탈금리</dt>
            <dd className="text-right">
              {item.capitalRatePercent !== null ? formatPercent(item.capitalRatePercent) : "-"}
            </dd>
            <dt>월지원금(VAT제외)</dt>
            <dd className="text-right">
              {item.monthlySupportExVat !== null ? formatWon(item.monthlySupportExVat) : "-"}
            </dd>
          </>
        )}
        <dt className="text-amber-700 dark:text-amber-500">공급가</dt>
        <dd className="text-right text-amber-700 dark:text-amber-500">
          {item.supplyPrice !== null ? formatWon(item.supplyPrice) : "-"}
        </dd>
        <dt className="text-amber-700 dark:text-amber-500">판매이익</dt>
        <dd className="text-right font-medium text-amber-700 dark:text-amber-500">
          {item.profit !== null ? formatWon(item.profit) : "-"}
        </dd>
      </dl>
    </div>
  );
}

import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuoteByAdvertiserId, hasAnyContractedLineItem } from "@/lib/quote-data";
import { formatWon, formatDate } from "@/lib/format";

export default async function SalesDashboardPage() {
  const session = await requireRole("SALES");

  const advertisers = await prisma.advertiser.findMany({
    where: { salesRepId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  const allRows = await Promise.all(
    advertisers.map(async (advertiser) => {
      const data = await getQuoteByAdvertiserId(advertiser.id);
      return { advertiser, data };
    })
  );

  // 계약한 광고주(수량이 1개 이상 입력된 상품이 있는 경우)만 표시
  const rows = allRows.filter(({ data }) => data && hasAnyContractedLineItem(data.result.lineItems));

  const totalRevenue = rows.reduce((s, r) => s + (r.data?.result.totals.totalIncVat ?? 0), 0);
  const totalSalesProfit = rows.reduce((s, r) => s + (r.data?.result.totalSalesProfit ?? 0), 0);
  const totalMonthlyProfit = rows.reduce((s, r) => s + (r.data?.result.fee.monthlyProfit ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">내 담당 광고주</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">계약이 성립된 광고주 {rows.length}곳</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="총매출 (VAT포함)" value={`${formatWon(totalRevenue)}원`} />
        <StatTile label="총판매이익" value={`${formatWon(totalSalesProfit)}원`} />
        <StatTile label="총매월이익(PG수수료)" value={`${formatWon(totalMonthlyProfit)}원`} />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <p>아직 계약이 성립된 광고주가 없습니다.</p>
          <p className="mt-1 text-sm">
            광고주가 회원가입 시 담당 영업자로 <span className="font-semibold">{session.name}</span>님을
            선택하고 상품 수량을 입력하면 여기에 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ advertiser, data }) => (
            <Link
              key={advertiser.id}
              href={`/sales/advertisers/${advertiser.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-50">
                    {advertiser.companyName}
                  </p>
                  <p className="text-xs text-slate-400">{advertiser.businessRegNo}</p>
                </div>
                {data && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      data.result.promise.feasible
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    }`}
                  >
                    {data.result.promise.feasible ? "가능" : "불가능"}
                  </span>
                )}
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">계약금액</dt>
                  <dd className="text-slate-700 dark:text-slate-300">
                    {formatWon(data?.result.totals.totalIncVat ?? 0)}원
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">판매이익</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {formatWon(data?.result.totalSalesProfit ?? 0)}원
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">PG수수료이익</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100">
                    {formatWon(data?.result.pgProfitOverSupportPeriod ?? 0)}원
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">계약기간</dt>
                  <dd className="text-slate-700 dark:text-slate-300">
                    {formatDate(data?.contractStartDate ?? null)} ~ {formatDate(data?.contractEndDate ?? null)}
                  </dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuoteByAdvertiserId, getMasterData } from "@/lib/quote-data";
import { formatWon } from "@/lib/format";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; rep?: string }>;
}) {
  await requireRole("ADMIN");
  const { view: viewParam, rep: selectedRepId } = await searchParams;
  const view = viewParam === "byrep" ? "byrep" : "all";

  const [salesReps, master] = await Promise.all([
    prisma.user.findMany({
      where: { role: "SALES" },
      orderBy: { createdAt: "asc" },
      include: { advertisersManaged: true },
    }),
    getMasterData(),
  ]);

  const repSummaries = await Promise.all(
    salesReps.map(async (rep) => {
      const results = await Promise.all(
        rep.advertisersManaged.map((a) => getQuoteByAdvertiserId(a.id, master))
      );
      const totalContractAmount = results.reduce((s, r) => s + (r?.result.totals.totalIncVat ?? 0), 0);
      const totalProfit = results.reduce((s, r) => s + (r?.result.totalRevenueProfit ?? 0), 0);
      const feasibleCount = results.filter((r) => r?.result.promise.feasible).length;
      return {
        rep,
        advertiserCount: rep.advertisersManaged.length,
        totalContractAmount,
        totalProfit,
        feasibleCount,
      };
    })
  );

  const grandTotalAdvertisers = repSummaries.reduce((s, r) => s + r.advertiserCount, 0);
  const grandTotalAmount = repSummaries.reduce((s, r) => s + r.totalContractAmount, 0);
  const grandTotalProfit = repSummaries.reduce((s, r) => s + r.totalProfit, 0);

  const activeRepId = view === "byrep" ? selectedRepId ?? salesReps[0]?.id : undefined;
  const activeRep = activeRepId ? salesReps.find((r) => r.id === activeRepId) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">전체 영업 현황</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          영업자 {salesReps.length}명 · 광고주 {grandTotalAdvertisers}곳 · 계약금액 합계{" "}
          {formatWon(grandTotalAmount)}원 · 총 매출이익 합계 {formatWon(grandTotalProfit)}원
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">영업자</th>
              <th className="px-4 py-3 font-medium">담당 광고주</th>
              <th className="px-4 py-3 font-medium">지원가능</th>
              <th className="px-4 py-3 font-medium">계약금액(VAT포함)</th>
              <th className="px-4 py-3 font-medium">총 매출이익</th>
            </tr>
          </thead>
          <tbody>
            {repSummaries.map(({ rep, advertiserCount, totalContractAmount, totalProfit, feasibleCount }) => (
              <tr key={rep.id} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{rep.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{advertiserCount}곳</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {feasibleCount}/{advertiserCount}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {formatWon(totalContractAmount)}원
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {formatWon(totalProfit)}원
                </td>
              </tr>
            ))}
            {repSummaries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  등록된 영업자가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:inline-grid sm:w-auto">
          <Link
            href="/admin/dashboard?view=all"
            className={`rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${
              view === "all"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            전체 광고주
          </Link>
          <Link
            href={`/admin/dashboard?view=byrep${activeRepId ? `&rep=${activeRepId}` : ""}`}
            className={`rounded-md px-4 py-2 text-center text-sm font-medium transition-colors ${
              view === "byrep"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            영업자별 광고주
          </Link>
        </div>

        {view === "byrep" && (
          <div className="mb-4 flex flex-wrap gap-2">
            {salesReps.map((rep) => (
              <Link
                key={rep.id}
                href={`/admin/dashboard?view=byrep&rep=${rep.id}`}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  activeRepId === rep.id
                    ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {rep.name}
              </Link>
            ))}
            {salesReps.length === 0 && <p className="text-sm text-slate-400">등록된 영업자가 없습니다.</p>}
          </div>
        )}

        <h2 className="mb-3 text-base font-bold text-slate-900 dark:text-slate-50">
          {view === "byrep" ? `${activeRep?.name ?? ""} 담당 광고주` : "전체 광고주"}
        </h2>
        <AdvertisersList repId={view === "byrep" ? activeRepId : undefined} />
      </div>
    </div>
  );
}

async function AdvertisersList({ repId }: { repId?: string }) {
  const advertisers = await prisma.advertiser.findMany({
    where: repId ? { salesRepId: repId } : undefined,
    orderBy: { createdAt: "desc" },
    include: { salesRep: true },
  });

  if (advertisers.length === 0) {
    return <p className="text-sm text-slate-400">등록된 광고주가 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {advertisers.map((a) => (
        <Link
          key={a.id}
          href={`/admin/advertisers/${a.id}`}
          className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="font-medium text-slate-800 dark:text-slate-200">{a.companyName}</p>
          <p className="text-xs text-slate-400">
            {a.businessRegNo} · 담당 {a.salesRep.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

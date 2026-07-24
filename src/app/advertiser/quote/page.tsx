import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuoteByAdvertiserId, getProductsBySlot, groupLineItemsByCategory } from "@/lib/quote-data";
import { slotLabel } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { QuoteForm } from "@/components/quote/QuoteForm";
import { ResultCards } from "@/components/quote/ResultCards";
import { saveAdvertiserQuoteAction } from "./actions";
import type { CategoryGroupFormData } from "@/components/quote/types";

export default async function AdvertiserQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireRole("ADVERTISER");
  const { saved } = await searchParams;

  const advertiser = await prisma.advertiser.findUnique({ where: { id: session.sub } });
  if (!advertiser) {
    return <p className="text-slate-500">광고주 정보를 찾을 수 없습니다.</p>;
  }

  const data = await getQuoteByAdvertiserId(advertiser.id);
  if (!data) {
    return <p className="text-slate-500">견적 정보를 찾을 수 없습니다.</p>;
  }

  const productsBySlot = await getProductsBySlot();
  const grouped = groupLineItemsByCategory(data.result.lineItems);
  const groups: CategoryGroupFormData[] = grouped.map(({ category, items }) => ({
    categoryKey: category.key,
    categoryLabel: category.label,
    items: items.map((item) => {
      const options = productsBySlot[`${item.categoryKey}:${item.slotKey}`] ?? [];
      return {
        id: item.id,
        categoryKey: item.categoryKey,
        slotKey: item.slotKey,
        slotLabel: slotLabel(item.categoryKey, item.slotKey),
        productId: item.productId,
        productLabel: item.productLabel,
        quantity: item.quantity,
        discountRate: item.discountRate,
        retailPrice: item.retailPrice,
        finalExVat: item.finalExVat,
        finalIncVat: item.finalIncVat,
        hasFinancing: item.hasFinancing,
        capitalRatePercent: item.capitalRate,
        monthlySupportExVat: item.hasFinancing ? item.monthlySupportExVat : null,
        supplyPrice: null,
        profit: null,
        selectable: options.length > 1,
        productOptions: options,
      };
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          {advertiser.companyName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          사업자등록번호 {advertiser.businessRegNo}
        </p>
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          저장되었습니다. 아래 결과가 최신 내용입니다.
        </p>
      )}

      <QuoteForm
        groups={groups}
        initialPromisedMonthlyRevenue={data.promisedMonthlyRevenue}
        initialPayTier={data.payTier}
        initialContractStartDate={data.contractStartDate ? formatDate(data.contractStartDate) : ""}
        initialContractEndDate={data.contractEndDate ? formatDate(data.contractEndDate) : ""}
        saveAction={saveAdvertiserQuoteAction}
      />

      <ResultCards
        variant="advertiser"
        promise={data.result.promise}
        fee={data.result.fee}
        totalSalesProfit={data.result.totalSalesProfit}
        totalRevenueProfit={data.result.totalRevenueProfit}
      />
    </div>
  );
}

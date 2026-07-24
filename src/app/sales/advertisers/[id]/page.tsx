import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getQuoteByAdvertiserId,
  groupLineItemsByCategory,
  onlyContractedLineItems,
} from "@/lib/quote-data";
import { slotLabel } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { QuoteView } from "@/components/quote/QuoteView";
import { ResultCards } from "@/components/quote/ResultCards";
import type { CategoryGroupFormData } from "@/components/quote/types";

export default async function SalesAdvertiserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("SALES");
  const { id } = await params;

  const advertiser = await prisma.advertiser.findUnique({ where: { id } });
  if (!advertiser || advertiser.salesRepId !== session.sub) {
    notFound();
  }

  const data = await getQuoteByAdvertiserId(id);
  if (!data) {
    return <p className="text-slate-500">견적 정보를 찾을 수 없습니다.</p>;
  }

  const contractedItems = onlyContractedLineItems(data.result.lineItems);
  const grouped = groupLineItemsByCategory(contractedItems);
  const groups: CategoryGroupFormData[] = grouped.map(({ category, items }) => ({
    categoryKey: category.key,
    categoryLabel: category.label,
    items: items.map((item) => ({
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
      supplyPrice: item.supplyPrice,
      profit: item.profit,
      selectable: false,
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
          {advertiser.companyName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          사업자등록번호 {advertiser.businessRegNo} · 계약 내용은 광고주가 직접 입력합니다 (읽기 전용)
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          계약기간: {formatDate(data.contractStartDate)} ~ {formatDate(data.contractEndDate)}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          아직 계약된 상품이 없습니다. 광고주가 수량을 입력하면 여기에 표시됩니다.
        </p>
      ) : (
        <QuoteView groups={groups} />
      )}

      <ResultCards
        variant="internal"
        promise={data.result.promise}
        fee={data.result.fee}
        totalSalesProfit={data.result.totalSalesProfit}
        totalRevenueProfit={data.result.totalRevenueProfit}
      />
    </div>
  );
}

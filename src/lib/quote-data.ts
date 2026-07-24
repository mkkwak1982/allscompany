import "server-only";
import { prisma } from "@/lib/prisma";
import { calcQuote, type LineItemInput, type CalcMasterData, type QuoteCalcResult } from "@/lib/calc";
import { CATEGORIES, SLOTS } from "@/lib/catalog";

export async function getMasterData(): Promise<CalcMasterData> {
  const [capitalRates, cardFeeTiers, pgDeductionTiers, gradeThresholds, settings] =
    await Promise.all([
      prisma.capitalRate.findMany(),
      prisma.cardFeeTier.findMany(),
      prisma.pgDeductionTier.findMany(),
      prisma.gradeThreshold.findMany(),
      prisma.settings.findUnique({ where: { id: 1 } }),
    ]);

  return {
    capitalRates: Object.fromEntries(capitalRates.map((r) => [r.categoryKey, r.rate])),
    supportMonths: settings?.supportMonths ?? 48,
    cardFeeTiers: cardFeeTiers.map((t) => ({ payTier: t.payTier, grade: t.grade, feeRate: t.feeRate })),
    pgDeductionTiers: pgDeductionTiers.map((t) => ({ grade: t.grade, rate: t.rate })),
    gradeThresholds: gradeThresholds.map((t) => ({ grade: t.grade, minAnnualRevenue: t.minAnnualRevenue })),
    vanFeeRate: settings?.vanFeeRate ?? 0.012,
  };
}

/** 슬롯별로 선택 가능한 상품 목록 (모델 선택형 슬롯의 드롭다운용) */
export async function getProductsBySlot(): Promise<
  Record<string, { id: string; label: string; retailPrice: number; supplyPrice: number }[]>
> {
  const products = await prisma.product.findMany({ orderBy: { sortOrder: "asc" } });
  const bySlot: Record<string, { id: string; label: string; retailPrice: number; supplyPrice: number }[]> = {};
  for (const p of products) {
    const key = `${p.categoryKey}:${p.slotKey}`;
    if (!bySlot[key]) bySlot[key] = [];
    bySlot[key].push({ id: p.id, label: p.label, retailPrice: p.retailPrice, supplyPrice: p.supplyPrice });
  }
  return bySlot;
}

/** 신규 광고주 등록 시, 모든 카테고리/슬롯에 대해 기본 상품으로 라인아이템을 채운 견적을 생성 */
export async function createDefaultQuoteLineItems(quoteId: string) {
  const defaults = await prisma.product.findMany({ where: { isDefault: true } });
  const bySlot = new Map(defaults.map((p) => [`${p.categoryKey}:${p.slotKey}`, p]));

  const rows = SLOTS.map((slot) => {
    const product = bySlot.get(`${slot.categoryKey}:${slot.slotKey}`);
    if (!product) return null;
    return {
      quoteId,
      categoryKey: slot.categoryKey,
      slotKey: slot.slotKey,
      productId: product.id,
      quantity: 0,
      discountRate: 0,
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  await prisma.quoteLineItem.createMany({ data: rows });
}

export type QuoteWithCalc = {
  quoteId: string;
  advertiser: { id: string; businessRegNo: string; companyName: string; salesRepId: string };
  promisedMonthlyRevenue: number;
  payTier: number;
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  updatedAt: Date;
  result: QuoteCalcResult;
};

export async function getQuoteByAdvertiserId(advertiserId: string): Promise<QuoteWithCalc | null> {
  const advertiser = await prisma.advertiser.findUnique({
    where: { id: advertiserId },
    include: { quote: { include: { lineItems: { include: { product: true } } } } },
  });
  if (!advertiser || !advertiser.quote) return null;

  const master = await getMasterData();
  const lineItemInputs: LineItemInput[] = advertiser.quote.lineItems.map((li) => ({
    id: li.id,
    categoryKey: li.categoryKey,
    slotKey: li.slotKey,
    productId: li.productId,
    productLabel: li.product.label,
    quantity: li.quantity,
    discountRate: li.discountRate,
    retailPrice: li.product.retailPrice,
    supplyPrice: li.product.supplyPrice,
  }));

  const result = calcQuote(
    lineItemInputs,
    advertiser.quote.promisedMonthlyRevenue,
    advertiser.quote.payTier,
    master
  );

  return {
    quoteId: advertiser.quote.id,
    advertiser: {
      id: advertiser.id,
      businessRegNo: advertiser.businessRegNo,
      companyName: advertiser.companyName,
      salesRepId: advertiser.salesRepId,
    },
    promisedMonthlyRevenue: advertiser.quote.promisedMonthlyRevenue,
    payTier: advertiser.quote.payTier,
    contractStartDate: advertiser.quote.contractStartDate,
    contractEndDate: advertiser.quote.contractEndDate,
    updatedAt: advertiser.quote.updatedAt,
    result,
  };
}

/** 실제 계약이 성립된(수량이 1개 이상 입력된) 라인아이템만 필터링 */
export function onlyContractedLineItems<T extends { quantity: number }>(items: T[]): T[] {
  return items.filter((i) => i.quantity > 0);
}

export function hasAnyContractedLineItem(items: { quantity: number }[]): boolean {
  return items.some((i) => i.quantity > 0);
}

export function groupLineItemsByCategory<T extends { categoryKey: string; slotKey: string }>(
  items: T[]
): { category: (typeof CATEGORIES)[number]; items: T[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    items: items
      .filter((i) => i.categoryKey === category.key)
      .sort((a, b) => {
        const sa = SLOTS.find((s) => s.categoryKey === a.categoryKey && s.slotKey === a.slotKey)?.sortOrder ?? 0;
        const sb = SLOTS.find((s) => s.categoryKey === b.categoryKey && s.slotKey === b.slotKey)?.sortOrder ?? 0;
        return sa - sb;
      }),
  })).filter((g) => g.items.length > 0);
}

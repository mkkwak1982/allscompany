import "server-only";
import { prisma } from "@/lib/prisma";
import { PAY_TIERS } from "@/lib/catalog";

/** 계약 내용(모델/수량/할인율/매출약속액/페이/계약기간)은 광고주 모드에서만 입력 가능 */
export async function applyQuoteFormUpdates(quoteId: string, formData: FormData) {
  const promisedMonthlyRevenueRaw = Number(formData.get("promisedMonthlyRevenue"));
  const promisedMonthlyRevenue =
    Number.isFinite(promisedMonthlyRevenueRaw) && promisedMonthlyRevenueRaw >= 0
      ? promisedMonthlyRevenueRaw
      : 0;

  const payTierRaw = Number(formData.get("payTier"));
  const payTier = (PAY_TIERS as readonly number[]).includes(payTierRaw) ? payTierRaw : 1;

  const contractStartRaw = String(formData.get("contractStartDate") ?? "");
  const contractEndRaw = String(formData.get("contractEndDate") ?? "");
  const contractStartDate = contractStartRaw ? new Date(contractStartRaw) : null;
  const contractEndDate = contractEndRaw ? new Date(contractEndRaw) : null;

  const lineItems = await prisma.quoteLineItem.findMany({ where: { quoteId } });

  const updates: { id: string; quantity: number; discountRate: number; productId: string }[] = [];

  for (const li of lineItems) {
    const quantityRaw = Number(formData.get(`qty__${li.id}`));
    const quantity = Number.isFinite(quantityRaw) ? Math.max(0, Math.floor(quantityRaw)) : li.quantity;

    const discountPercentRaw = Number(formData.get(`disc__${li.id}`));
    const discountPercent = Number.isFinite(discountPercentRaw)
      ? Math.min(100, Math.max(0, discountPercentRaw))
      : li.discountRate * 100;
    const discountRate = discountPercent / 100;

    let productId = li.productId;
    const requested = formData.get(`product__${li.id}`);
    if (typeof requested === "string" && requested && requested !== li.productId) {
      const product = await prisma.product.findUnique({ where: { id: requested } });
      if (product && product.categoryKey === li.categoryKey && product.slotKey === li.slotKey) {
        productId = requested;
      }
    }

    updates.push({ id: li.id, quantity, discountRate, productId });
  }

  await prisma.$transaction([
    ...updates.map((u) =>
      prisma.quoteLineItem.update({
        where: { id: u.id },
        data: { quantity: u.quantity, discountRate: u.discountRate, productId: u.productId },
      })
    ),
    prisma.quote.update({
      where: { id: quoteId },
      data: { promisedMonthlyRevenue, payTier, contractStartDate, contractEndDate },
    }),
  ]);
}

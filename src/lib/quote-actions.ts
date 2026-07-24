import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAY_TIERS } from "@/lib/catalog";

/**
 * 계약 내용(모델/수량/할인율/매출약속액/페이/계약기간)은 광고주 모드에서만 입력 가능.
 * 라인아이템이 최대 26개라 개별 update를 날리면 원격 DB 왕복이 수십 번 발생해 저장이
 * 느려진다 (특히 Vercel-Neon처럼 리전이 떨어진 서버리스 환경). 한 번의 벌크 UPDATE로 묶는다.
 */
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

  const lineItems = await prisma.quoteLineItem.findMany({
    where: { quoteId },
    select: { id: true, categoryKey: true, slotKey: true, productId: true, quantity: true, discountRate: true },
  });

  // 모델이 바뀐 라인아이템만 모아서 한 번의 쿼리로 유효성 검증
  const requestedProductIds = new Set<string>();
  for (const li of lineItems) {
    const requested = formData.get(`product__${li.id}`);
    if (typeof requested === "string" && requested && requested !== li.productId) {
      requestedProductIds.add(requested);
    }
  }
  const candidateProducts = requestedProductIds.size
    ? await prisma.product.findMany({ where: { id: { in: Array.from(requestedProductIds) } } })
    : [];
  const candidateById = new Map(candidateProducts.map((p) => [p.id, p]));

  const updates = lineItems.map((li) => {
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
      const candidate = candidateById.get(requested);
      if (candidate && candidate.categoryKey === li.categoryKey && candidate.slotKey === li.slotKey) {
        productId = requested;
      }
    }

    return { id: li.id, quantity, discountRate, productId };
  });

  await prisma.$transaction(async (tx) => {
    if (updates.length > 0) {
      const rows = Prisma.join(
        updates.map(
          (u) => Prisma.sql`(${u.id}::text, ${u.quantity}::int, ${u.discountRate}::float8, ${u.productId}::text)`
        )
      );
      await tx.$executeRaw`
        UPDATE "QuoteLineItem" AS q
        SET quantity = v.quantity, "discountRate" = v.discount_rate, "productId" = v.product_id
        FROM (VALUES ${rows}) AS v(id, quantity, discount_rate, product_id)
        WHERE q.id = v.id
      `;
    }

    await tx.quote.update({
      where: { id: quoteId },
      data: { promisedMonthlyRevenue, payTier, contractStartDate, contractEndDate },
    });
  });
}

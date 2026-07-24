"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function saveProductsAction(categoryKey: string, formData: FormData) {
  await requireRole("ADMIN");

  const products = await prisma.product.findMany({ where: { categoryKey } });

  await prisma.$transaction(
    products.map((p) => {
      const label = String(formData.get(`label__${p.id}`) ?? p.label).trim() || p.label;
      const retailPriceRaw = Number(formData.get(`retail__${p.id}`));
      const supplyPriceRaw = Number(formData.get(`supply__${p.id}`));
      const retailPrice = Number.isFinite(retailPriceRaw) && retailPriceRaw >= 0 ? retailPriceRaw : p.retailPrice;
      const supplyPrice = Number.isFinite(supplyPriceRaw) && supplyPriceRaw >= 0 ? supplyPriceRaw : p.supplyPrice;
      return prisma.product.update({
        where: { id: p.id },
        data: { label, retailPrice, supplyPrice },
      });
    })
  );

  redirect(`/admin/products?saved=1#${categoryKey}`);
}

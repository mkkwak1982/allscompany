"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function saveRatesAction(formData: FormData) {
  await requireRole("ADMIN");

  const rates = await prisma.capitalRate.findMany();

  await prisma.$transaction(
    rates.map((r) => {
      const percentRaw = Number(formData.get(`rate__${r.categoryKey}`));
      const rate = Number.isFinite(percentRaw) && percentRaw >= 0 ? percentRaw / 100 : r.rate;
      return prisma.capitalRate.update({ where: { categoryKey: r.categoryKey }, data: { rate } });
    })
  );

  redirect("/admin/rates?saved=1");
}

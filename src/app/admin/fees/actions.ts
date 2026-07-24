"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function keyFor(payTier: number, grade: string) {
  return `${payTier}__${grade}`;
}

export async function saveCardFeeTiersAction(formData: FormData) {
  await requireRole("ADMIN");
  const tiers = await prisma.cardFeeTier.findMany();

  await prisma.$transaction(
    tiers.map((t) => {
      const raw = Number(formData.get(`fee__${keyFor(t.payTier, t.grade)}`));
      const feeRate = Number.isFinite(raw) && raw >= 0 ? raw / 100 : t.feeRate;
      return prisma.cardFeeTier.update({ where: { id: t.id }, data: { feeRate } });
    })
  );

  redirect("/admin/fees?saved=1#card-fee");
}

export async function savePgDeductionTiersAction(formData: FormData) {
  await requireRole("ADMIN");
  const tiers = await prisma.pgDeductionTier.findMany();

  await prisma.$transaction(
    tiers.map((t) => {
      const raw = Number(formData.get(`pg__${t.grade}`));
      const rate = Number.isFinite(raw) && raw >= 0 ? raw / 100 : t.rate;
      return prisma.pgDeductionTier.update({ where: { grade: t.grade }, data: { rate } });
    })
  );

  redirect("/admin/fees?saved=1#pg-deduction");
}

export async function saveGradeThresholdsAction(formData: FormData) {
  await requireRole("ADMIN");
  const thresholds = await prisma.gradeThreshold.findMany();

  await prisma.$transaction(
    thresholds.map((t) => {
      const raw = Number(formData.get(`threshold__${t.grade}`));
      const minAnnualRevenue = Number.isFinite(raw) && raw >= 0 ? raw : t.minAnnualRevenue;
      return prisma.gradeThreshold.update({ where: { grade: t.grade }, data: { minAnnualRevenue } });
    })
  );

  redirect("/admin/fees?saved=1#grade-threshold");
}

export async function saveSettingsAction(formData: FormData) {
  await requireRole("ADMIN");

  const vanFeeRaw = Number(formData.get("vanFeeRate"));
  const monthsRaw = Number(formData.get("supportMonths"));

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {
      vanFeeRate: Number.isFinite(vanFeeRaw) && vanFeeRaw >= 0 ? vanFeeRaw / 100 : undefined,
      supportMonths: Number.isFinite(monthsRaw) && monthsRaw > 0 ? Math.round(monthsRaw) : undefined,
    },
    create: {
      id: 1,
      vanFeeRate: Number.isFinite(vanFeeRaw) && vanFeeRaw >= 0 ? vanFeeRaw / 100 : 0.012,
      supportMonths: Number.isFinite(monthsRaw) && monthsRaw > 0 ? Math.round(monthsRaw) : 48,
    },
  });

  redirect("/admin/fees?saved=1#settings");
}

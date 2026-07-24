"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { createDefaultQuoteLineItems } from "@/lib/quote-data";

export type SignupState = { error?: string };

export async function signupAdvertiserAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const businessRegNo = String(formData.get("businessRegNo") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const salesRepId = String(formData.get("salesRepId") ?? "").trim();

  if (!businessRegNo || !companyName || !salesRepId) {
    return { error: "사업자등록번호, 상호명, 담당 영업사원을 모두 입력해주세요." };
  }

  const salesRep = await prisma.user.findUnique({ where: { id: salesRepId } });
  if (!salesRep || salesRep.role !== "SALES") {
    return { error: "담당 영업사원을 다시 선택해주세요." };
  }

  const existingBiz = await prisma.advertiser.findUnique({ where: { businessRegNo } });
  if (existingBiz) {
    return { error: "이미 등록된 사업자등록번호입니다." };
  }

  const { advertiserId, quoteId } = await prisma.$transaction(async (tx) => {
    const advertiser = await tx.advertiser.create({
      data: { businessRegNo, companyName, salesRepId },
    });
    const quote = await tx.quote.create({ data: { advertiserId: advertiser.id } });
    return { advertiserId: advertiser.id, quoteId: quote.id };
  });

  await createDefaultQuoteLineItems(quoteId);

  await createSession({
    sub: advertiserId,
    role: "ADVERTISER",
    username: businessRegNo,
    name: companyName,
  });
  redirect("/advertiser/quote");
}

"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { applyQuoteFormUpdates } from "@/lib/quote-actions";
import type { SaveState } from "@/components/quote/QuoteForm";

export async function saveAdvertiserQuoteAction(
  _prevState: SaveState,
  formData: FormData
): Promise<SaveState> {
  const session = await requireRole("ADVERTISER");

  const advertiser = await prisma.advertiser.findUnique({
    where: { id: session.sub },
    include: { quote: true },
  });
  if (!advertiser || !advertiser.quote) {
    return { error: "광고주 정보를 찾을 수 없습니다." };
  }

  await applyQuoteFormUpdates(advertiser.quote.id, formData);

  redirect("/advertiser/quote?saved=1");
}

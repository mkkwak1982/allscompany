// 엑셀 "비용산출" / "비용산출_광고주" 시트의 계산 체인을 그대로 포팅한 순수 계산 엔진.
// 입력값 + 마스터데이터(캐피탈금리/수수료 매트릭스 등)를 받아 매번 재계산한다 (엑셀처럼 항상 최신 상태 유지).

export type LineItemInput = {
  id: string;
  categoryKey: string;
  slotKey: string;
  productId: string;
  productLabel: string;
  quantity: number;
  discountRate: number;
  retailPrice: number;
  supplyPrice: number;
};

export type LineItemResult = LineItemInput & {
  hasFinancing: boolean;
  totalBeforeDiscount: number; // 총액 (E)
  finalExVat: number; // 최종 총액(VAT제외) (G)
  finalIncVat: number; // 최종 총액(VAT포함) (H)
  capitalRate: number | null; // 적용캐피탈금리 (I)
  supportMonths: number | null; // 지원기간 (J)
  monthlySupport: number; // 월 지원금 (K)
  monthlySupportExVat: number; // 월지원금(VAT제외) (L)
  costTotal: number; // 원가 총액 (N)
  profit: number; // 판매이익 (O)
};

export type PromiseSectionResult = {
  promisedMonthlyRevenue: number;
  promisedAnnualRevenue: number;
  payTier: number;
  suppliedTotalExVat: number; // 납품기자재 총액
  requiredMinimum: number; // 총액 X 페이
  feasible: boolean; // 매출약속 기반 지원가능 여부
};

export type FeeSectionResult = {
  grade: string;
  confirmedFeeRate: number;
  monthlyFee: number; // 매월 수수료
  monthlySupportTotal: number; // 매월 지원금
  pgDeductionRate: number;
  pgDeductionAmount: number; // PG차감액
  monthlyProfit: number; // 매월 이익
  vanFeeRate: number;
  vanFee: number;
  diff: number; // 차액
  diffExcludingSupport: number; // 지원금 제외 차액
  additionalFeeRate: number; // 추가 수수료율
};

export type QuoteTotals = {
  totalBeforeDiscount: number;
  totalExVat: number;
  totalIncVat: number;
  totalProfit: number;
  totalMonthlySupportExVat: number;
};

export type QuoteCalcResult = {
  lineItems: LineItemResult[];
  totals: QuoteTotals;
  promise: PromiseSectionResult;
  fee: FeeSectionResult;
  totalSalesProfit: number; // 15. 총 매출 이익 - 판매이익
  pgProfitOverSupportPeriod: number; // PG수수료 이익(48개월)
  totalRevenueProfit: number; // 총 매출 이익
};

/** 원리금균등상환(annuity) 월 상환액. principal: VAT포함 총액, annualRate: 연이율(0.139 등), months: 지원기간(개월) */
export function annuityPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * (r * factor)) / (factor - 1);
}

export function calcLineItem(
  input: LineItemInput,
  capitalRate: number | null,
  supportMonths: number
): LineItemResult {
  const hasFinancing = capitalRate !== null;
  const totalBeforeDiscount = input.retailPrice * input.quantity;
  const finalExVat = totalBeforeDiscount * (1 - input.discountRate);
  const finalIncVat = finalExVat * 1.1;
  const monthlySupport = hasFinancing
    ? annuityPayment(finalIncVat, capitalRate as number, supportMonths)
    : 0;
  const monthlySupportExVat = hasFinancing ? monthlySupport / 1.1 : 0;
  const costTotal = input.supplyPrice * input.quantity;
  const profit = finalExVat - costTotal;

  return {
    ...input,
    hasFinancing,
    totalBeforeDiscount,
    finalExVat,
    finalIncVat,
    capitalRate: hasFinancing ? (capitalRate as number) : null,
    supportMonths: hasFinancing ? supportMonths : null,
    monthlySupport,
    monthlySupportExVat,
    costTotal,
    profit,
  };
}

/** 연매출 기준 매출구간(등급) 분류. thresholds는 minAnnualRevenue 내림차순 정렬 여부 상관없이 동작. */
export function classifyGrade(
  annualRevenue: number,
  thresholds: { grade: string; minAnnualRevenue: number }[]
): string {
  const sorted = [...thresholds].sort((a, b) => b.minAnnualRevenue - a.minAnnualRevenue);
  for (const t of sorted) {
    if (annualRevenue >= t.minAnnualRevenue) return t.grade;
  }
  return sorted[sorted.length - 1]?.grade ?? "영세";
}

export type CalcMasterData = {
  capitalRates: Record<string, number>; // categoryKey -> rate
  supportMonths: number; // 기본 48
  cardFeeTiers: { payTier: number; grade: string; feeRate: number }[];
  pgDeductionTiers: { grade: string; rate: number }[];
  gradeThresholds: { grade: string; minAnnualRevenue: number }[];
  vanFeeRate: number;
};

export function calcQuote(
  lineItemInputs: LineItemInput[],
  promisedMonthlyRevenue: number,
  payTier: number,
  master: CalcMasterData
): QuoteCalcResult {
  const lineItems = lineItemInputs.map((li) =>
    calcLineItem(li, master.capitalRates[li.categoryKey] ?? null, master.supportMonths)
  );

  const totals: QuoteTotals = {
    totalBeforeDiscount: sum(lineItems.map((l) => l.totalBeforeDiscount)),
    totalExVat: sum(lineItems.map((l) => l.finalExVat)),
    totalIncVat: sum(lineItems.map((l) => l.finalIncVat)),
    totalProfit: sum(lineItems.map((l) => l.profit)),
    totalMonthlySupportExVat: sum(lineItems.map((l) => l.monthlySupportExVat)),
  };

  const promisedAnnualRevenue = promisedMonthlyRevenue * 12;
  const requiredMinimum = totals.totalExVat * payTier;
  const promise: PromiseSectionResult = {
    promisedMonthlyRevenue,
    promisedAnnualRevenue,
    payTier,
    suppliedTotalExVat: totals.totalExVat,
    requiredMinimum,
    feasible: requiredMinimum < promisedMonthlyRevenue,
  };

  const grade = classifyGrade(promisedAnnualRevenue, master.gradeThresholds);
  const confirmedFeeRate =
    master.cardFeeTiers.find((t) => t.payTier === payTier && t.grade === grade)?.feeRate ?? 0;
  const monthlyFee = promisedMonthlyRevenue * confirmedFeeRate;
  const monthlySupportTotal = totals.totalMonthlySupportExVat;
  const pgDeductionRate = master.pgDeductionTiers.find((t) => t.grade === grade)?.rate ?? 0;
  const pgDeductionAmount = promisedMonthlyRevenue * pgDeductionRate;
  const monthlyProfit = monthlyFee - monthlySupportTotal - pgDeductionAmount;
  const vanFee = promisedMonthlyRevenue * master.vanFeeRate;
  const diff = monthlyFee - vanFee;
  const diffExcludingSupport = diff - monthlySupportTotal;
  const additionalFeeRate =
    promisedMonthlyRevenue > 0 ? diffExcludingSupport / promisedMonthlyRevenue : 0;

  const fee: FeeSectionResult = {
    grade,
    confirmedFeeRate,
    monthlyFee,
    monthlySupportTotal,
    pgDeductionRate,
    pgDeductionAmount,
    monthlyProfit,
    vanFeeRate: master.vanFeeRate,
    vanFee,
    diff,
    diffExcludingSupport,
    additionalFeeRate,
  };

  const totalSalesProfit = totals.totalProfit;
  const pgProfitOverSupportPeriod = monthlyProfit * master.supportMonths;
  const totalRevenueProfit = totalSalesProfit + pgProfitOverSupportPeriod;

  return {
    lineItems,
    totals,
    promise,
    fee,
    totalSalesProfit,
    pgProfitOverSupportPeriod,
    totalRevenueProfit,
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

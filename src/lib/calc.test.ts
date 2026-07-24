// 회귀 테스트: 엑셀 실측값과 대조. `npx tsx src/lib/calc.test.ts` 로 실행.
import assert from "node:assert";
import { calcLineItem, annuityPayment, calcQuote } from "./calc";

function approxEqual(actual: number, expected: number, tolerance: number) {
  assert(
    Math.abs(actual - expected) <= tolerance,
    `expected ${expected}, got ${actual} (tolerance ${tolerance})`
  );
}

// 테이블오더 태블릿, 수량 7, 할인율 0%, 판매단가 500,000, 캐피탈금리 11.9%, 48개월
// 엑셀 실측: 총액 3,500,000 / VAT포함 3,850,000 / 월지원금 101,196.3 / 월지원금(VAT제외) 91,997
{
  const result = calcLineItem(
    {
      id: "test",
      categoryKey: "table_order",
      slotKey: "tablet",
      productId: "p1",
      productLabel: "태블릿",
      quantity: 7,
      discountRate: 0,
      retailPrice: 500_000,
      supplyPrice: 120_000,
    },
    0.119,
    48
  );

  approxEqual(result.totalBeforeDiscount, 3_500_000, 0.01);
  approxEqual(result.finalExVat, 3_500_000, 0.01);
  approxEqual(result.finalIncVat, 3_850_000, 0.01);
  approxEqual(result.monthlySupport, 101_196.3, 1);
  approxEqual(result.monthlySupportExVat, 91_997, 1);
  console.log("PASS: 테이블오더 태블릿 x7 회귀 테스트");
}

// 포스 카테고리 예시 검증: 포스 본체 1대, 할인율 10%, 판매단가 600,000, 공급가 450,000, 금리 11.9%
// 엑셀 실측: 최종총액(VAT제외) 540,000 / VAT포함 594,000 / 월지원금 15,613.1 / 월지원금(VAT제외) 14,194 / 판매이익 90,000
{
  const result = calcLineItem(
    {
      id: "test2",
      categoryKey: "pos",
      slotKey: "pos",
      productId: "p2",
      productLabel: "포스",
      quantity: 1,
      discountRate: 0.1,
      retailPrice: 600_000,
      supplyPrice: 450_000,
    },
    0.119,
    48
  );

  approxEqual(result.finalExVat, 540_000, 0.01);
  approxEqual(result.finalIncVat, 594_000, 0.01);
  approxEqual(result.monthlySupport, 15_613.1, 1);
  approxEqual(result.monthlySupportExVat, 14_194, 1);
  approxEqual(result.profit, 90_000, 0.01);
  console.log("PASS: 포스 본체 x1 회귀 테스트");
}

// annuityPayment 단독 검증
{
  const payment = annuityPayment(3_850_000, 0.119, 48);
  approxEqual(payment, 101_196.3, 1);
  console.log("PASS: annuityPayment 단독 검증");
}

// 매출약속/PG수수료 섹션 통합 검증 (임의 시나리오, 회귀 방지용 스냅샷 성격)
{
  const result = calcQuote(
    [
      {
        id: "1",
        categoryKey: "table_order",
        slotKey: "tablet",
        productId: "p1",
        productLabel: "태블릿",
        quantity: 7,
        discountRate: 0,
        retailPrice: 500_000,
        supplyPrice: 120_000,
      },
    ],
    10_000_000,
    2,
    {
      capitalRates: { table_order: 0.119 },
      supportMonths: 48,
      cardFeeTiers: [{ payTier: 2, grade: "영세", feeRate: 0.0245 }],
      pgDeductionTiers: [{ grade: "영세", rate: 0.009 }],
      gradeThresholds: [
        { grade: "일반", minAnnualRevenue: 3_000_000_000 },
        { grade: "중소3", minAnnualRevenue: 1_000_000_000 },
        { grade: "중소2", minAnnualRevenue: 500_000_000 },
        { grade: "중소1", minAnnualRevenue: 300_000_000 },
        { grade: "영세", minAnnualRevenue: 0 },
      ],
      vanFeeRate: 0.012,
    }
  );

  assert.strictEqual(result.fee.grade, "영세");
  // 총액(VAT제외) 3,500,000 * 페이 2 = 7,000,000 < 10,000,000 => 가능
  assert.strictEqual(result.promise.feasible, true);
  approxEqual(result.fee.monthlyFee, 245_000, 0.01); // 10,000,000 * 0.0245
  console.log("PASS: calcQuote 통합 시나리오");
}

console.log("\nAll calc.ts regression tests passed.");

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// categoryKey -> Korean display label (엑셀 시트명 기준)
export const CATEGORIES: { key: string; label: string; hasFinancing: boolean }[] = [
  { key: "usc", label: "1. 초음파세척기", hasFinancing: true },
  { key: "home_usc", label: "2. 가정용 초음파세척기", hasFinancing: false },
  { key: "food_waste", label: "3. 음식물처리기", hasFinancing: true },
  { key: "fryer", label: "4. 초음파튀김기", hasFinancing: true },
  { key: "pressure_washer", label: "5. 수압식세척기", hasFinancing: false },
  { key: "induction_pot", label: "6. 인덕션 솥밥", hasFinancing: true },
  { key: "table_order", label: "7. 테이블오더", hasFinancing: true },
  { key: "pos", label: "8. 포스", hasFinancing: true },
  { key: "kiosk", label: "9. 키오스크", hasFinancing: true },
  { key: "serving_robot", label: "10. 서빙로봇", hasFinancing: true },
];

type ProductSeed = {
  categoryKey: string;
  slotKey: string;
  slotSelectable: boolean;
  defaultDiscount: number;
  label: string;
  model: string;
  retailPrice: number;
  supplyPrice: number;
  sortOrder: number;
  isDefault?: boolean;
};

const products: ProductSeed[] = [
  // 1. 초음파세척기 (모델 선택형, 18종)
  ...[
    ["P-500", 4_500_000, 1_800_000],
    ["P-600", 5_000_000, 2_000_000],
    ["P-700", 5_500_000, 2_200_000],
    ["P-800", 6_000_000, 2_400_000],
    ["P-900", 6_500_000, 2_600_000],
    ["P-1000", 7_000_000, 2_800_000],
    ["P-1200", 8_000_000, 3_300_000],
    ["P-1500", 9_500_000, 4_100_000],
    ["P-1800", 11_000_000, 4_900_000],
    ["L-500", 5_000_000, 1_900_000],
    ["L-600", 5_500_000, 2_100_000],
    ["L-700", 6_000_000, 2_300_000],
    ["L-800", 6_500_000, 2_500_000],
    ["L-900", 7_000_000, 2_700_000],
    ["L-1000", 7_500_000, 3_000_000],
    ["L-1200", 8_500_000, 3_700_000],
    ["L-1500", 10_000_000, 4_500_000],
    ["L-1800", 11_500_000, 5_500_000],
  ].map(([model, retail, supply], i) => ({
    categoryKey: "usc",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.1,
    label: model as string,
    model: model as string,
    retailPrice: retail as number,
    supplyPrice: supply as number,
    sortOrder: i + 1,
    isDefault: model === "L-800",
  })),

  // 2. 가정용 초음파세척기 (단일, 금융 없음)
  {
    categoryKey: "home_usc",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: "가정용 초음파세척기",
    model: "가정용 초음파세척기",
    retailPrice: 3_000_000,
    supplyPrice: 1_500_000,
    sortOrder: 1,
    isDefault: true,
  },

  // 3. 음식물처리기 (모델 선택형, 4종)
  ...[
    ["EOS-ZERO 50", 9_500_000, 5_000_000],
    ["EOS-ZERO 100", 13_500_000, 7_000_000],
    ["EOS-ZERO 150", 16_500_000, 9_000_000],
    ["EOS-ZERO 200", 19_500_000, 11_000_000],
  ].map(([model, retail, supply], i) => ({
    categoryKey: "food_waste",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.1,
    label: model as string,
    model: model as string,
    retailPrice: retail as number,
    supplyPrice: supply as number,
    sortOrder: i + 1,
    isDefault: i === 0,
  })),

  // 4. 초음파튀김기 (모델 선택형, 2종)
  ...[
    ["FRY 450", 4_000_000, 1_700_000],
    ["FRY 600", 4_500_000, 1_900_000],
  ].map(([model, retail, supply], i) => ({
    categoryKey: "fryer",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: model as string,
    model: model as string,
    retailPrice: retail as number,
    supplyPrice: supply as number,
    sortOrder: i + 1,
    isDefault: i === 0,
  })),

  // 5. 수압식세척기 (단일, 금융 없음)
  {
    categoryKey: "pressure_washer",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: "수압식세척기",
    model: "수압식세척기",
    retailPrice: 1_800_000,
    supplyPrice: 1_200_000,
    sortOrder: 1,
    isDefault: true,
  },

  // 6. 인덕션 솥밥 (하우징 선택형 + 고정 부속 5종)
  {
    categoryKey: "induction_pot",
    slotKey: "housing",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: "5열 4단(20구) 하우징",
    model: "5열 4단(20구) 하우징",
    retailPrice: 1_000_000,
    supplyPrice: 600_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "induction_pot",
    slotKey: "housing",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: "5열 3단(15구) 하우징",
    model: "5열 3단(15구) 하우징",
    retailPrice: 800_000,
    supplyPrice: 450_000,
    sortOrder: 2,
  },
  {
    categoryKey: "induction_pot",
    slotKey: "induction",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "인덕션",
    model: "인덕션",
    retailPrice: 300_000,
    supplyPrice: 90_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "induction_pot",
    slotKey: "pot",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "솥 용기",
    model: "솥 용기",
    retailPrice: 30_000,
    supplyPrice: 17_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "induction_pot",
    slotKey: "lid_pressure",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "압력뚜껑",
    model: "압력뚜껑",
    retailPrice: 40_000,
    supplyPrice: 25_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "induction_pot",
    slotKey: "lid_wood",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "나무뚜껑",
    model: "나무뚜껑",
    retailPrice: 5_000,
    supplyPrice: 3_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "induction_pot",
    slotKey: "base_wood",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "나무받침",
    model: "나무받침",
    retailPrice: 10_000,
    supplyPrice: 6_000,
    sortOrder: 1,
    isDefault: true,
  },

  // 7. 테이블오더 (고정 3종)
  {
    categoryKey: "table_order",
    slotKey: "tablet",
    slotSelectable: false,
    defaultDiscount: 0,
    label: "태블릿",
    model: "태블릿",
    retailPrice: 500_000,
    supplyPrice: 120_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "table_order",
    slotKey: "stand",
    slotSelectable: false,
    defaultDiscount: 0,
    label: "테이블오더 거치대",
    model: "테이블오더 거치대",
    retailPrice: 70_000,
    supplyPrice: 35_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "table_order",
    slotKey: "battery",
    slotSelectable: false,
    defaultDiscount: 0,
    label: "보조배터리",
    model: "보조배터리",
    retailPrice: 50_000,
    supplyPrice: 30_000,
    sortOrder: 1,
    isDefault: true,
  },

  // 8. 포스 (고정 8종)
  {
    categoryKey: "pos",
    slotKey: "pos",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "포스",
    model: "포스",
    retailPrice: 600_000,
    supplyPrice: 450_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "cash_drawer",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "금전함",
    model: "금전함",
    retailPrice: 45_000,
    supplyPrice: 30_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "prepaid_reader",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "선불결제리더기",
    model: "선불결제리더기",
    retailPrice: 70_000,
    supplyPrice: 47_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "printer",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "용지프린터",
    model: "용지프린터",
    retailPrice: 80_000,
    supplyPrice: 58_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "multipad",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "멀티패드",
    model: "멀티패드",
    retailPrice: 200_000,
    supplyPrice: 95_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "terminal_signpad",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "3인치 단말기 + 싸인패드",
    model: "3인치 단말기 + 싸인패드",
    retailPrice: 300_000,
    supplyPrice: 170_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "paper",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "포스용지",
    model: "포스용지",
    retailPrice: 45_000,
    supplyPrice: 35_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "pos",
    slotKey: "dual_monitor",
    slotSelectable: false,
    defaultDiscount: 0.1,
    label: "듀얼모니터",
    model: "듀얼모니터",
    retailPrice: 300_000,
    supplyPrice: 160_000,
    sortOrder: 1,
    isDefault: true,
  },

  // 9. 키오스크 (모델 선택형, 2종)
  {
    categoryKey: "kiosk",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: "키오스크(탁상형)",
    model: "키오스크(탁상형)",
    retailPrice: 1_500_000,
    supplyPrice: 800_000,
    sortOrder: 1,
  },
  {
    categoryKey: "kiosk",
    slotKey: "main",
    slotSelectable: true,
    defaultDiscount: 0.05,
    label: "키오스크(스탠드형)",
    model: "키오스크(스탠드형)",
    retailPrice: 1_700_000,
    supplyPrice: 950_000,
    sortOrder: 2,
    isDefault: true,
  },

  // 10. 서빙로봇 (고정 3종)
  {
    categoryKey: "serving_robot",
    slotKey: "robot",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "서빙로봇",
    model: "서빙로봇",
    retailPrice: 15_000_000,
    supplyPrice: 6_500_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "serving_robot",
    slotKey: "bell_hub",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "호출벨 셋탑박스",
    model: "호출벨 셋탑박스",
    retailPrice: 800_000,
    supplyPrice: 600_000,
    sortOrder: 1,
    isDefault: true,
  },
  {
    categoryKey: "serving_robot",
    slotKey: "bell",
    slotSelectable: false,
    defaultDiscount: 0.05,
    label: "호출벨",
    model: "호출벨",
    retailPrice: 10_000,
    supplyPrice: 7_000,
    sortOrder: 1,
    isDefault: true,
  },
];

// 한국캐피탈 금리 (품목별, 변경후 금리 기준). 금융 미지원 품목은 항목 없음.
const capitalRates: Record<string, number> = {
  usc: 0.139,
  food_waste: 0.139,
  fryer: 0.16,
  induction_pot: 0.17,
  table_order: 0.119,
  pos: 0.119,
  kiosk: 0.119,
  serving_robot: 0.119,
};

// 계약서 수수료: 페이(코페이 %) x 매출구간(등급) 매트릭스
const cardFeeTiers: { payTier: number; grade: string; feeRate: number }[] = [
  { payTier: 1, grade: "일반", feeRate: 0.058 },
  { payTier: 1, grade: "중소3", feeRate: 0.05 },
  { payTier: 1, grade: "중소2", feeRate: 0.0475 },
  { payTier: 1, grade: "중소1", feeRate: 0.046 },
  { payTier: 1, grade: "영세", feeRate: 0.038 },

  { payTier: 1.5, grade: "일반", feeRate: 0.0425 },
  { payTier: 1.5, grade: "중소3", feeRate: 0.0415 },
  { payTier: 1.5, grade: "중소2", feeRate: 0.0405 },
  { payTier: 1.5, grade: "중소1", feeRate: 0.039 },
  { payTier: 1.5, grade: "영세", feeRate: 0.0335 },

  { payTier: 2, grade: "일반", feeRate: 0.04 },
  { payTier: 2, grade: "중소3", feeRate: 0.0365 },
  { payTier: 2, grade: "중소2", feeRate: 0.034 },
  { payTier: 2, grade: "중소1", feeRate: 0.0325 },
  { payTier: 2, grade: "영세", feeRate: 0.0245 },

  { payTier: 2.5, grade: "일반", feeRate: 0.04 },
  { payTier: 2.5, grade: "중소3", feeRate: 0.0338 },
  { payTier: 2.5, grade: "중소2", feeRate: 0.0313 },
  { payTier: 2.5, grade: "중소1", feeRate: 0.0298 },
  { payTier: 2.5, grade: "영세", feeRate: 0.0218 },

  { payTier: 3, grade: "일반", feeRate: 0.04 },
  { payTier: 3, grade: "중소3", feeRate: 0.032 },
  { payTier: 3, grade: "중소2", feeRate: 0.0295 },
  { payTier: 3, grade: "중소1", feeRate: 0.028 },
  { payTier: 3, grade: "영세", feeRate: 0.02 },
];

// PG 차감수수료 (D+1 기준), 등급별 고정 - 페이와 무관
const pgDeductionTiers: { grade: string; rate: number }[] = [
  { grade: "일반", rate: 0.027 },
  { grade: "중소3", rate: 0.0195 },
  { grade: "중소2", rate: 0.017 },
  { grade: "중소1", rate: 0.0155 },
  { grade: "영세", rate: 0.009 },
];

// 매출구간 등급 기준 (연매출 하한액)
const gradeThresholds: { grade: string; minAnnualRevenue: number; sortOrder: number }[] = [
  { grade: "일반", minAnnualRevenue: 3_000_000_000, sortOrder: 5 },
  { grade: "중소3", minAnnualRevenue: 1_000_000_000, sortOrder: 4 },
  { grade: "중소2", minAnnualRevenue: 500_000_000, sortOrder: 3 },
  { grade: "중소1", minAnnualRevenue: 300_000_000, sortOrder: 2 },
  { grade: "영세", minAnnualRevenue: 0, sortOrder: 1 },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.create({
      data: {
        categoryKey: p.categoryKey,
        slotKey: p.slotKey,
        label: p.label,
        model: p.model,
        retailPrice: p.retailPrice,
        supplyPrice: p.supplyPrice,
        sortOrder: p.sortOrder,
        isDefault: p.isDefault ?? false,
      },
    });
  }

  console.log("Seeding capital rates...");
  for (const [categoryKey, rate] of Object.entries(capitalRates)) {
    await prisma.capitalRate.create({ data: { categoryKey, rate } });
  }

  console.log("Seeding card fee tiers...");
  for (const t of cardFeeTiers) {
    await prisma.cardFeeTier.create({ data: t });
  }

  console.log("Seeding PG deduction tiers...");
  for (const t of pgDeductionTiers) {
    await prisma.pgDeductionTier.create({ data: t });
  }

  console.log("Seeding grade thresholds...");
  for (const t of gradeThresholds) {
    await prisma.gradeThreshold.create({ data: t });
  }

  console.log("Seeding settings...");
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, vanFeeRate: 0.012, supportMonths: 48 },
  });

  console.log("Seeding admin & demo sales account...");
  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      role: "ADMIN",
      username: "admin",
      passwordHash: adminPasswordHash,
      name: "관리자",
    },
  });

  const salesPasswordHash = await bcrypt.hash("sales1234", 10);
  await prisma.user.upsert({
    where: { username: "sales1" },
    update: {},
    create: {
      role: "SALES",
      username: "sales1",
      passwordHash: salesPasswordHash,
      passwordPlain: "sales1234",
      name: "김영업",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

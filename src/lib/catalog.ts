// 품목 카테고리 및 슬롯(라인) 메타데이터.
// 실제 제품 가격은 DB(Product 테이블)가 소스이며, 여기서는 화면 표시용 라벨/그룹핑/정렬만 정의한다.

export type Category = {
  key: string;
  label: string;
  hasFinancing: boolean;
  sortOrder: number;
};

export type Slot = {
  categoryKey: string;
  slotKey: string;
  label: string;
  selectable: boolean;
  sortOrder: number;
};

export const CATEGORIES: Category[] = [
  { key: "usc", label: "1. 초음파세척기", hasFinancing: true, sortOrder: 1 },
  { key: "home_usc", label: "2. 가정용 초음파세척기", hasFinancing: false, sortOrder: 2 },
  { key: "food_waste", label: "3. 음식물처리기", hasFinancing: true, sortOrder: 3 },
  { key: "fryer", label: "4. 초음파튀김기", hasFinancing: true, sortOrder: 4 },
  { key: "pressure_washer", label: "5. 수압식세척기", hasFinancing: false, sortOrder: 5 },
  { key: "induction_pot", label: "6. 인덕션 솥밥", hasFinancing: true, sortOrder: 6 },
  { key: "table_order", label: "7. 테이블오더", hasFinancing: true, sortOrder: 7 },
  { key: "pos", label: "8. 포스", hasFinancing: true, sortOrder: 8 },
  { key: "kiosk", label: "9. 키오스크", hasFinancing: true, sortOrder: 9 },
  { key: "serving_robot", label: "10. 서빙로봇", hasFinancing: true, sortOrder: 10 },
];

export const SLOTS: Slot[] = [
  { categoryKey: "usc", slotKey: "main", label: "모델 선택", selectable: true, sortOrder: 1 },

  { categoryKey: "home_usc", slotKey: "main", label: "모델 선택", selectable: true, sortOrder: 1 },

  { categoryKey: "food_waste", slotKey: "main", label: "모델 선택", selectable: true, sortOrder: 1 },

  { categoryKey: "fryer", slotKey: "main", label: "모델 선택", selectable: true, sortOrder: 1 },

  { categoryKey: "pressure_washer", slotKey: "main", label: "모델 선택", selectable: true, sortOrder: 1 },

  { categoryKey: "induction_pot", slotKey: "housing", label: "하우징", selectable: true, sortOrder: 1 },
  { categoryKey: "induction_pot", slotKey: "induction", label: "인덕션", selectable: false, sortOrder: 2 },
  { categoryKey: "induction_pot", slotKey: "pot", label: "솥 용기", selectable: false, sortOrder: 3 },
  { categoryKey: "induction_pot", slotKey: "lid_pressure", label: "압력뚜껑", selectable: false, sortOrder: 4 },
  { categoryKey: "induction_pot", slotKey: "lid_wood", label: "나무뚜껑", selectable: false, sortOrder: 5 },
  { categoryKey: "induction_pot", slotKey: "base_wood", label: "나무받침", selectable: false, sortOrder: 6 },

  { categoryKey: "table_order", slotKey: "tablet", label: "태블릿", selectable: false, sortOrder: 1 },
  { categoryKey: "table_order", slotKey: "stand", label: "테이블오더 거치대", selectable: false, sortOrder: 2 },
  { categoryKey: "table_order", slotKey: "battery", label: "보조배터리", selectable: false, sortOrder: 3 },

  { categoryKey: "pos", slotKey: "pos", label: "포스", selectable: false, sortOrder: 1 },
  { categoryKey: "pos", slotKey: "cash_drawer", label: "금전함", selectable: false, sortOrder: 2 },
  { categoryKey: "pos", slotKey: "prepaid_reader", label: "선불결제리더기", selectable: false, sortOrder: 3 },
  { categoryKey: "pos", slotKey: "printer", label: "용지프린터", selectable: false, sortOrder: 4 },
  { categoryKey: "pos", slotKey: "multipad", label: "멀티패드", selectable: false, sortOrder: 5 },
  { categoryKey: "pos", slotKey: "terminal_signpad", label: "3인치 단말기 + 싸인패드", selectable: false, sortOrder: 6 },
  { categoryKey: "pos", slotKey: "paper", label: "포스용지", selectable: false, sortOrder: 7 },
  { categoryKey: "pos", slotKey: "dual_monitor", label: "듀얼모니터", selectable: false, sortOrder: 8 },

  { categoryKey: "kiosk", slotKey: "main", label: "모델 선택", selectable: true, sortOrder: 1 },

  { categoryKey: "serving_robot", slotKey: "robot", label: "서빙로봇", selectable: false, sortOrder: 1 },
  { categoryKey: "serving_robot", slotKey: "bell_hub", label: "호출벨 셋탑박스", selectable: false, sortOrder: 2 },
  { categoryKey: "serving_robot", slotKey: "bell", label: "호출벨", selectable: false, sortOrder: 3 },
];

export const PAY_TIERS = [1, 1.5, 2, 2.5, 3] as const;

export function payTierLabel(tier: number): string {
  return `${Math.round(tier * 100)}%`;
}

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function slotLabel(categoryKey: string, slotKey: string): string {
  return (
    SLOTS.find((s) => s.categoryKey === categoryKey && s.slotKey === slotKey)?.label ?? slotKey
  );
}

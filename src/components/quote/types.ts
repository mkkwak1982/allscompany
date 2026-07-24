export type ProductOption = {
  id: string;
  label: string;
  retailPrice: number;
  supplyPrice: number;
};

export type LineItemFormData = {
  id: string;
  categoryKey: string;
  slotKey: string;
  slotLabel: string;
  productId: string;
  productLabel: string;
  quantity: number;
  discountRate: number; // 0~1
  retailPrice: number;
  finalExVat: number;
  finalIncVat: number;
  hasFinancing: boolean;
  capitalRatePercent: number | null;
  monthlySupportExVat: number | null;
  // 아래 두 필드는 광고주 모드에서는 null (공급가/판매이익 비노출)
  supplyPrice: number | null;
  profit: number | null;
  selectable: boolean;
  productOptions?: ProductOption[];
};

export type CategoryGroupFormData = {
  categoryKey: string;
  categoryLabel: string;
  items: LineItemFormData[];
};

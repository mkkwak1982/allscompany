"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { formatPercent, formatWon } from "@/lib/format";
import { PAY_TIERS, payTierLabel } from "@/lib/catalog";
import type { CategoryGroupFormData, LineItemFormData } from "./types";

export type SaveState = { error?: string; success?: boolean };

type Props = {
  groups: CategoryGroupFormData[];
  initialPromisedMonthlyRevenue: number;
  initialPayTier: number;
  initialContractStartDate: string;
  initialContractEndDate: string;
  saveAction: (prevState: SaveState, formData: FormData) => Promise<SaveState>;
};

type RowState = { quantity: number; discountRate: number; productId: string };

/** 광고주 전용 입력 폼: 모델 선택/수량/할인율/매출약속액/페이/계약기간 (녹색 셀)만 입력 가능 */
export function QuoteForm({
  groups,
  initialPromisedMonthlyRevenue,
  initialPayTier,
  initialContractStartDate,
  initialContractEndDate,
  saveAction,
}: Props) {
  const initialRowState = useMemo(() => {
    const map: Record<string, RowState> = {};
    for (const g of groups) {
      for (const item of g.items) {
        map[item.id] = {
          quantity: item.quantity,
          discountRate: item.discountRate,
          productId: item.productId,
        };
      }
    }
    return map;
  }, [groups]);

  const [rowState, setRowState] = useState<Record<string, RowState>>(initialRowState);
  const [promisedMonthlyRevenue, setPromisedMonthlyRevenue] = useState(initialPromisedMonthlyRevenue);
  const [payTier, setPayTier] = useState(initialPayTier);
  const [contractStartDate, setContractStartDate] = useState(initialContractStartDate);
  const [contractEndDate, setContractEndDate] = useState(initialContractEndDate);
  const [state, formAction, pending] = useActionState(saveAction, {});

  function updateRow(id: string, patch: Partial<RowState>) {
    setRowState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  const allItems: LineItemFormData[] = groups.flatMap((g) => g.items);
  const previewSuppliedTotal = allItems.reduce((sum, item) => {
    const row = rowState[item.id];
    const retailPrice = item.productOptions?.find((o) => o.id === row.productId)?.retailPrice ?? item.retailPrice;
    const finalExVat = retailPrice * row.quantity * (1 - row.discountRate);
    return sum + finalExVat;
  }, 0);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="promisedMonthlyRevenue" value={promisedMonthlyRevenue} />
      <input type="hidden" name="payTier" value={payTier} />
      <input type="hidden" name="contractStartDate" value={contractStartDate} />
      <input type="hidden" name="contractEndDate" value={contractEndDate} />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">계약기간</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              시작일
            </label>
            <input
              type="date"
              value={contractStartDate}
              onChange={(e) => setContractStartDate(e.target.value)}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-base outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              종료일
            </label>
            <input
              type="date"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-base outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-slate-100"
            />
          </div>
        </div>
      </section>

      {groups.map((group) => (
        <CategoryGroup key={group.categoryKey} group={group} rowState={rowState} updateRow={updateRow} />
      ))}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
          매출약속 및 페이 설정
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              매출약속액 (월, 원)
            </label>
            <input
              type="number"
              min={0}
              step={10000}
              inputMode="numeric"
              value={promisedMonthlyRevenue}
              onChange={(e) => setPromisedMonthlyRevenue(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-base outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              페이 (코페이 비율)
            </label>
            <select
              value={payTier}
              onChange={(e) => setPayTier(Number(e.target.value))}
              className="w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-base outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-slate-100"
            >
              {PAY_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {payTierLabel(tier)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          납품기자재 총액(예상): {formatWon(previewSuppliedTotal)}원 · 저장 후 아래 결과 카드에 반영됩니다.
        </p>
      </section>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          저장되었습니다.
        </p>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60 sm:w-auto sm:px-8 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {pending ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

function CategoryGroup({
  group,
  rowState,
  updateRow,
}: {
  group: CategoryGroupFormData;
  rowState: Record<string, RowState>;
  updateRow: (id: string, patch: Partial<RowState>) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
        {group.categoryLabel}
      </h2>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th className="py-2 pr-3 font-medium">품목</th>
              <th className="py-2 pr-3 font-medium">수량</th>
              <th className="py-2 pr-3 font-medium">할인율</th>
              <th className="py-2 pr-3 font-medium">총액</th>
              <th className="py-2 pr-3 font-medium">최종총액(VAT제외)</th>
              <th className="py-2 pr-3 font-medium">VAT포함</th>
              {group.items[0]?.hasFinancing && (
                <>
                  <th className="py-2 pr-3 font-medium">캐피탈금리</th>
                  <th className="py-2 pr-3 font-medium">월지원금(VAT제외)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {group.items.map((item) => (
              <ItemRowDesktop key={item.id} item={item} row={rowState[item.id]} updateRow={updateRow} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {group.items.map((item) => (
          <ItemCardMobile key={item.id} item={item} row={rowState[item.id]} updateRow={updateRow} />
        ))}
      </div>
    </section>
  );
}

function liveCalc(retailPrice: number, row: RowState) {
  const totalBeforeDiscount = retailPrice * row.quantity;
  const finalExVat = totalBeforeDiscount * (1 - row.discountRate);
  const finalIncVat = finalExVat * 1.1;
  return { totalBeforeDiscount, finalExVat, finalIncVat };
}

function ItemRowDesktop({
  item,
  row,
  updateRow,
}: {
  item: LineItemFormData;
  row: RowState;
  updateRow: (id: string, patch: Partial<RowState>) => void;
}) {
  const retailPrice = item.productOptions?.find((o) => o.id === row.productId)?.retailPrice ?? item.retailPrice;
  const { totalBeforeDiscount, finalExVat, finalIncVat } = liveCalc(retailPrice, row);

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800/60">
      <td className="py-2 pr-3 align-top">
        {item.selectable && item.productOptions ? (
          <select
            name={`product__${item.id}`}
            value={row.productId}
            onChange={(e) => updateRow(item.id, { productId: e.target.value })}
            className="w-40 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-sm dark:border-emerald-700 dark:bg-emerald-950/30"
          >
            {item.productOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-slate-700 dark:text-slate-300">{item.productLabel}</span>
        )}
        <div className="mt-0.5 text-xs text-slate-400">{item.slotLabel}</div>
      </td>
      <td className="py-2 pr-3 align-top">
        <input
          type="number"
          min={0}
          name={`qty__${item.id}`}
          value={row.quantity}
          onChange={(e) => updateRow(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
          inputMode="numeric"
          className="w-20 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-sm dark:border-emerald-700 dark:bg-emerald-950/30"
        />
      </td>
      <td className="py-2 pr-3 align-top">
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            name={`disc__${item.id}`}
            value={Math.round(row.discountRate * 100)}
            onChange={(e) =>
              updateRow(item.id, { discountRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100 })
            }
            inputMode="numeric"
            className="w-16 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-sm dark:border-emerald-700 dark:bg-emerald-950/30"
          />
          <span className="text-slate-400">%</span>
        </div>
      </td>
      <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-700 dark:text-slate-300">
        {formatWon(totalBeforeDiscount)}
      </td>
      <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-700 dark:text-slate-300">
        {formatWon(finalExVat)}
      </td>
      <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-700 dark:text-slate-300">
        {formatWon(finalIncVat)}
      </td>
      {item.hasFinancing && (
        <>
          <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-500 dark:text-slate-400">
            {item.capitalRatePercent !== null ? formatPercent(item.capitalRatePercent) : "-"}
          </td>
          <td className="py-2 pr-3 align-top whitespace-nowrap text-slate-500 dark:text-slate-400">
            {item.monthlySupportExVat !== null ? formatWon(item.monthlySupportExVat) : "-"}
          </td>
        </>
      )}
    </tr>
  );
}

function ItemCardMobile({
  item,
  row,
  updateRow,
}: {
  item: LineItemFormData;
  row: RowState;
  updateRow: (id: string, patch: Partial<RowState>) => void;
}) {
  const retailPrice = item.productOptions?.find((o) => o.id === row.productId)?.retailPrice ?? item.retailPrice;
  const { totalBeforeDiscount, finalExVat, finalIncVat } = liveCalc(retailPrice, row);

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="mb-2 flex items-center justify-between">
        {item.selectable && item.productOptions ? (
          <select
            name={`product__${item.id}`}
            value={row.productId}
            onChange={(e) => updateRow(item.id, { productId: e.target.value })}
            className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-sm dark:border-emerald-700 dark:bg-emerald-950/30"
          >
            {item.productOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-medium text-slate-800 dark:text-slate-200">{item.productLabel}</span>
        )}
        <span className="text-xs text-slate-400">{item.slotLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-slate-500 dark:text-slate-400">
          수량
          <input
            type="number"
            min={0}
            name={`qty__${item.id}`}
            value={row.quantity}
            onChange={(e) => updateRow(item.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-emerald-300 bg-emerald-50 px-2 py-2 text-base dark:border-emerald-700 dark:bg-emerald-950/30"
          />
        </label>
        <label className="text-xs text-slate-500 dark:text-slate-400">
          할인율 (%)
          <input
            type="number"
            min={0}
            max={100}
            name={`disc__${item.id}`}
            value={Math.round(row.discountRate * 100)}
            onChange={(e) =>
              updateRow(item.id, { discountRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)) / 100 })
            }
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-emerald-300 bg-emerald-50 px-2 py-2 text-base dark:border-emerald-700 dark:bg-emerald-950/30"
          />
        </label>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <dt>총액</dt>
        <dd className="text-right text-slate-700 dark:text-slate-300">{formatWon(totalBeforeDiscount)}</dd>
        <dt>최종총액(VAT제외)</dt>
        <dd className="text-right text-slate-700 dark:text-slate-300">{formatWon(finalExVat)}</dd>
        <dt>VAT포함</dt>
        <dd className="text-right text-slate-700 dark:text-slate-300">{formatWon(finalIncVat)}</dd>
        {item.hasFinancing && (
          <>
            <dt>캐피탈금리</dt>
            <dd className="text-right">{item.capitalRatePercent !== null ? formatPercent(item.capitalRatePercent) : "-"}</dd>
            <dt>월지원금(VAT제외)</dt>
            <dd className="text-right">
              {item.monthlySupportExVat !== null ? formatWon(item.monthlySupportExVat) : "-"}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}

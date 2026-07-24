import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, slotLabel } from "@/lib/catalog";
import { saveProductsAction } from "./actions";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("ADMIN");
  const { saved } = await searchParams;

  const products = await prisma.product.findMany({ orderBy: [{ categoryKey: "asc" }, { slotKey: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">품목 마스터 관리</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          1. 초음파세척기 ~ 10. 서빙로봇 품목의 판매단가/공급가를 관리합니다.
        </p>
      </div>

      {saved && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          저장되었습니다.
        </p>
      )}

      {CATEGORIES.map((category) => {
        const items = products.filter((p) => p.categoryKey === category.key);
        if (items.length === 0) return null;
        const boundSave = saveProductsAction.bind(null, category.key);

        return (
          <section
            key={category.key}
            id={category.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
              {category.label}
            </h2>
            <form action={boundSave} className="space-y-3">
              <div className="hidden grid-cols-[1fr_1fr_140px_140px] gap-3 px-1 text-xs font-medium text-slate-500 md:grid dark:text-slate-400">
                <span>슬롯</span>
                <span>표시명</span>
                <span>판매단가/소비자가</span>
                <span>공급가</span>
              </div>
              {items.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-slate-100 p-3 md:grid-cols-[1fr_1fr_140px_140px] md:items-center md:border-0 md:p-0 dark:border-slate-800"
                >
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {slotLabel(p.categoryKey, p.slotKey)}
                  </span>
                  <input
                    name={`label__${p.id}`}
                    defaultValue={p.label}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <input
                    type="number"
                    name={`retail__${p.id}`}
                    defaultValue={p.retailPrice}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                  <input
                    type="number"
                    name={`supply__${p.id}`}
                    defaultValue={p.supplyPrice}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
              >
                {category.label} 저장
              </button>
            </form>
          </section>
        );
      })}
    </div>
  );
}

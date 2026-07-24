"use client";

import { useActionState } from "react";
import { createSalesAction, type CreateSalesState } from "./actions";

const initialState: CreateSalesState = {};

export function NewSalesForm() {
  const [state, formAction, pending] = useActionState(createSalesAction, initialState);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-base font-bold text-slate-900 dark:text-slate-50">
        신규 영업자 계정 발급
      </h2>
      <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:items-end">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            아이디
          </label>
          <input
            name="username"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            이름
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            비밀번호
          </label>
          <input
            name="password"
            type="text"
            required
            minLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-base font-medium text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
        >
          {pending ? "생성 중..." : "계정 생성"}
        </button>
      </form>

      {state.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <p className="font-medium">
            {state.success.name} ({state.success.username}) 계정이 생성되었습니다.
          </p>
        </div>
      )}
    </div>
  );
}

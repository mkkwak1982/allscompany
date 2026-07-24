"use client";

import { useActionState, useState } from "react";
import { resetSalesPasswordAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordInline({
  userId,
  currentPassword,
}: {
  userId: string;
  currentPassword: string;
}) {
  const [value, setValue] = useState(currentPassword);
  const boundAction = resetSalesPasswordAction.bind(null, userId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        name="password"
        type="text"
        required
        minLength={6}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-32 rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
      >
        {pending ? "변경 중..." : "변경"}
      </button>
      {state.success && <span className="text-sm text-emerald-600 dark:text-emerald-400">변경됨</span>}
      {state.error && <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

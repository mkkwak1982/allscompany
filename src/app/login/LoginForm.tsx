"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "./actions";

const ROLE_TABS: { value: "ADMIN" | "SALES" | "ADVERTISER"; label: string }[] = [
  { value: "ADMIN", label: "관리자" },
  { value: "SALES", label: "영업자" },
  { value: "ADVERTISER", label: "광고주" },
];

const initialState: LoginState = {};

export function LoginForm() {
  const [role, setRole] = useState<"ADMIN" | "SALES" | "ADVERTISER">("ADVERTISER");
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">올스컴퍼니</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">영업 관리 시스템 로그인</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setRole(tab.value)}
            className={`rounded-md px-2 py-2 text-sm font-medium transition-colors ${
              role === tab.value
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        {role === "ADVERTISER" ? (
          <>
            <Field label="사업자등록번호" name="businessRegNo" placeholder="000-00-00000" />
            <Field label="담당 영업사원 아이디" name="salesUsername" autoComplete="username" />
            <Field
              label="담당 영업사원 비밀번호"
              name="salesPassword"
              type="password"
              autoComplete="current-password"
            />
          </>
        ) : (
          <>
            <Field label="아이디" name="username" autoComplete="username" />
            <Field label="비밀번호" name="password" type="password" autoComplete="current-password" />
          </>
        )}

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {pending ? "로그인 중..." : `${ROLE_TABS.find((t) => t.value === role)?.label}로 로그인`}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100"
      />
    </div>
  );
}

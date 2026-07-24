"use client";

import { useActionState } from "react";
import { signupAdvertiserAction, type SignupState } from "./actions";

const initialState: SignupState = {};

export function SignupForm({ salesReps }: { salesReps: { id: string; name: string; username: string }[] }) {
  const [state, formAction, pending] = useActionState(signupAdvertiserAction, initialState);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 text-center">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">올스컴퍼니</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">광고주 회원가입</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            사업자등록번호
          </label>
          <input
            name="businessRegNo"
            type="text"
            required
            placeholder="000-00-00000"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            상호명
          </label>
          <input
            name="companyName"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            담당 영업자
          </label>
          <select
            name="salesRepId"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="">선택해주세요</option>
            {salesReps.map((rep) => (
              <option key={rep.id} value={rep.id}>
                {rep.name} ({rep.username})
              </option>
            ))}
          </select>
          {salesReps.length === 0 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              등록된 영업자가 없습니다. 관리자에게 영업자 계정 발급을 요청해주세요.
            </p>
          )}
        </div>

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
          {pending ? "가입 중..." : "광고주로 가입"}
        </button>
        <p className="text-center text-xs text-slate-400">
          가입 후 로그인은 사업자등록번호와 담당 영업사원의 아이디/비밀번호로 진행됩니다.
        </p>
      </form>
    </div>
  );
}

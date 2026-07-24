"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type CreateSalesState = {
  error?: string;
  success?: { username: string; name: string };
};

function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  return null;
}

export async function createSalesAction(
  _prevState: CreateSalesState,
  formData: FormData
): Promise<CreateSalesState> {
  await requireRole("ADMIN");

  const username = String(formData.get("username") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !name || !password) {
    return { error: "아이디, 이름, 비밀번호를 모두 입력해주세요." };
  }
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
    return { error: "아이디는 영문/숫자로 3~30자여야 합니다." };
  }
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "이미 사용중인 아이디입니다." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { role: "SALES", username, passwordHash, passwordPlain: password, name },
  });

  revalidatePath("/admin/sales");

  return { success: { username, name } };
}

export type ResetPasswordState = { error?: string; success?: boolean };

export async function resetSalesPasswordAction(
  userId: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  await requireRole("ADMIN");

  const password = String(formData.get("password") ?? "");
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "SALES") {
    return { error: "영업자 계정을 찾을 수 없습니다." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash, passwordPlain: password } });

  revalidatePath("/admin/sales");

  return { success: true };
}

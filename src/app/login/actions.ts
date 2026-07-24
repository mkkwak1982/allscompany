"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, dashboardPathForRole, type Role } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const role = String(formData.get("role") ?? "");

  if (role === "ADMIN" || role === "SALES") {
    return loginAsStaff(role, formData);
  }
  if (role === "ADVERTISER") {
    return loginAsAdvertiser(formData);
  }
  return { error: "잘못된 접근입니다." };
}

async function loginAsStaff(role: "ADMIN" | "SALES", formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "아이디와 비밀번호를 입력해주세요." };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.role !== role) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession({
    sub: user.id,
    role: user.role as Role,
    username: user.username,
    name: user.name,
  });

  redirect(dashboardPathForRole(user.role as Role));
}

async function loginAsAdvertiser(formData: FormData): Promise<LoginState> {
  const businessRegNo = String(formData.get("businessRegNo") ?? "").trim();
  const salesUsername = String(formData.get("salesUsername") ?? "").trim();
  const salesPassword = String(formData.get("salesPassword") ?? "");

  if (!businessRegNo || !salesUsername || !salesPassword) {
    return { error: "사업자등록번호와 담당 영업사원 아이디/비밀번호를 입력해주세요." };
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessRegNo },
    include: { salesRep: true },
  });
  if (!advertiser) {
    return { error: "등록되지 않은 사업자등록번호입니다." };
  }
  if (advertiser.salesRep.username !== salesUsername) {
    return { error: "담당 영업사원 정보가 일치하지 않습니다." };
  }

  const ok = await bcrypt.compare(salesPassword, advertiser.salesRep.passwordHash);
  if (!ok) {
    return { error: "담당 영업사원 정보가 일치하지 않습니다." };
  }

  await createSession({
    sub: advertiser.id,
    role: "ADVERTISER",
    username: advertiser.businessRegNo,
    name: advertiser.companyName,
  });

  redirect(dashboardPathForRole("ADVERTISER"));
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

async function readRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return (payload as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiredRole = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/sales")
      ? "SALES"
      : pathname.startsWith("/advertiser")
        ? "ADVERTISER"
        : null;

  if (!requiredRole) return NextResponse.next();

  const role = await readRole(request);
  if (role !== requiredRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/advertiser/:path*"],
};

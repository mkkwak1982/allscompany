import { redirect } from "next/navigation";
import { getSession, dashboardPathForRole } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  redirect(session ? dashboardPathForRole(session.role) : "/login");
}

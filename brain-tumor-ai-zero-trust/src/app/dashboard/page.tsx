// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { handler } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(handler);

  if (!session) {
    redirect("/auth/sign-in");
  }

  return <DashboardClient />;
}

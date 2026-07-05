import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true, email: true },
  });

  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar userName={user?.name} userEmail={user?.email} />
      <main className="min-w-0 flex-1 overflow-y-auto bg-neutral-50 p-6 dark:bg-neutral-950 lg:p-10">
        {children}
      </main>
    </div>
  );
}

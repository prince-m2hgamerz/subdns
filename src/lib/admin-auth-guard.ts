import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type AuthSuccess = { allowed: true; userId: string; role: string };
type AuthFailure = { allowed: false; response: NextResponse };
export type AuthResult = AuthSuccess | AuthFailure;

export async function requireAdmin(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const role = (session?.user as { role?: string })?.role;

  if (!userId) {
    return { allowed: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { allowed: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { allowed: true, userId, role };
}

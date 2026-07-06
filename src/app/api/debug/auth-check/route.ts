import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) return false;
  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "email+password required" }, { status: 400 });

  const { data: user, error } = await supabase
    .from("users")
    .select("password")
    .eq("email", email)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const compareResult = user.password ? await bcrypt.compare(password, user.password) : false;

  return NextResponse.json({
    found: true,
    bcryptCompare: compareResult,
  });
}

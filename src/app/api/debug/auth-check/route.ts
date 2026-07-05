import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "?email= required" }, { status: 400 });

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  return NextResponse.json({
    found: !!user,
    hasPassword: !!(user as any)?.password,
    passwordLength: ((user as any)?.password || "").length,
    passwordStartsWith: ((user as any)?.password || "").startsWith("$2") ? "$2..." : "no",
    columns: user ? Object.keys(user) : [],
    queryError: error ? { message: error.message, code: error.code, details: error.details } : null,
    userExists: user ? { id: (user as any).id, email: (user as any).email, name: (user as any).name } : null,
  });
}

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "email+password required" }, { status: 400 });

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const pwField = (user as any)?.password;
  const compareResult = pwField ? await bcrypt.compare(password, pwField) : false;

  return NextResponse.json({
    found: true,
    hasPassword: !!pwField,
    bcryptCompare: compareResult,
  });
}

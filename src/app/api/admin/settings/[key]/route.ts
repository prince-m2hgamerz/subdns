import { NextResponse } from "next/server";
import { deleteSetting } from "@/lib/settings-store";
import { requireAdmin } from "@/lib/admin-auth-guard";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.allowed) return auth.response;

  const { key } = await params;
  const settings = await deleteSetting(key);

  return NextResponse.json({ settings });
}

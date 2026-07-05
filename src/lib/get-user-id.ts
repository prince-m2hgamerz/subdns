import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.slice("Bearer ".length).trim();
    const apiKey = await prisma.apiKey.findUnique({ where: { key } });
    if (apiKey) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsed: new Date() },
      });
      return apiKey.userId;
    }
    return null;
  }

  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalUsers, totalSubdomains, totalRecords] = await Promise.all([
    prisma.user.count(),
    prisma.subdomain.count(),
    prisma.dnsRecord.count(),
  ]);

  return NextResponse.json({
    subdomains: totalSubdomains,
    dnsRecords: totalRecords,
    users: totalUsers,
    uptime: 99.9,
  });
}

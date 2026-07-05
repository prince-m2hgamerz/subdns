import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { isValidSubdomain, isReservedName } from "@/lib/utils";
import { getUserId } from "@/lib/get-user-id";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subdomains = await prisma.subdomain.findMany({
    where: { userId },
      include: { dnsRecords: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subdomains });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, target, type = "CNAME", proxied = false } = await req.json();

  if (!name || !target) {
    return NextResponse.json({ error: "Name and target are required" }, { status: 400 });
  }

  if (!isValidSubdomain(name)) {
    return NextResponse.json(
      { error: "Invalid subdomain name. Use only lowercase letters, numbers, and hyphens." },
      { status: 400 }
    );
  }

  if (isReservedName(name)) {
    return NextResponse.json({ error: "This subdomain name is reserved." }, { status: 400 });
  }

  const existing = await prisma.subdomain.findUnique({
    where: { name_domain: { name, domain: "m2hio.in" } },
  });

  if (existing) {
    return NextResponse.json({ error: "Subdomain already taken" }, { status: 409 });
  }

  const userSubdomainCount = await prisma.subdomain.count({
    where: { userId },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const limit = user?.maxSubdomains ?? 10;

  if (userSubdomainCount >= limit) {
    return NextResponse.json(
      { error: `Subdomain limit (${limit}) reached` },
      { status: 429 }
    );
  }

  try {
    const cfRecord = await createDnsRecord({
      type,
      name,
      content: target,
      proxied,
      ttl: 1,
    });

    const subdomain = await prisma.subdomain.create({
      data: {
        name,
        domain: "m2hio.in",
        fullDomain: `${name}.m2hio.in`,
        target,
        type,
        proxied,
        status: "ACTIVE",
        cloudflareId: cfRecord.result?.id ?? "",
      userId,
    },
    include: { dnsRecords: true },
    });

    await logActivity({
      userId,
      event: "SUBDOMAIN_CREATED",
      metadata: { name, domain: "m2hio.in", target, type, proxied },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ subdomain }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

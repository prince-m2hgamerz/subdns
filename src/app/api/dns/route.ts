import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDnsRecord, detectDuplicateRecords } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subdomainId, type, name, content, ttl = 1, priority, proxied = false } = await req.json();

  if (!subdomainId || !type || !content) {
    return NextResponse.json(
      { error: "subdomainId, type, and content are required" },
      { status: 400 }
    );
  }

  const { validateDnsRecord } = await import("@/lib/cloudflare");
  const validation = await validateDnsRecord(type, content);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error || `Invalid ${type} record value` },
      { status: 400 }
    );
  }

  const subdomain = await prisma.subdomain.findFirst({
    where: { id: subdomainId, userId },
  });

  if (!subdomain) {
    return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
  }

  const recordCount = await prisma.dnsRecord.count({
    where: { subdomainId },
  });

  if (recordCount >= 50) {
    return NextResponse.json({ error: "DNS record limit (50) reached" }, { status: 429 });
  }

  const isDuplicate = await detectDuplicateRecords(
    type,
    name ?? subdomain.name,
    content
  );

  if (isDuplicate) {
    return NextResponse.json({ error: "This DNS record already exists" }, { status: 409 });
  }

  try {
    const cfRecord = await createDnsRecord({
      type,
      name: name ?? subdomain.name,
      content,
      proxied,
      ttl,
      ...(priority !== undefined ? { priority } : {}),
    });

    const record = await prisma.dnsRecord.create({
      data: {
        type,
        name: name ?? subdomain.name,
        content,
        ttl,
        priority,
        proxied,
        status: "ACTIVE",
        cloudflareId: cfRecord.result?.id ?? "",
        subdomainId,
      },
    });

    await logActivity({
      userId,
      event: "DNS_CREATED",
      metadata: { subdomainId, type, name, content },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create DNS record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

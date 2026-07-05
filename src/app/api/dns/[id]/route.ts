import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDnsRecord, deleteDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content, ttl, priority, proxied } = await req.json();

  const record = await prisma.dnsRecord.findFirst({
    where: { id, subdomain: { userId } },
  });

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (record.cloudflareId) {
      await updateDnsRecord(record.cloudflareId, {
        type: record.type,
        name: record.name,
        content: content ?? record.content,
        proxied: proxied ?? record.proxied,
        ttl: ttl ?? record.ttl ?? 1,
        ...(priority !== undefined ? { priority } : {}),
      });
    }

    const updated = await prisma.dnsRecord.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(ttl !== undefined && { ttl }),
        ...(priority !== undefined && { priority }),
        ...(proxied !== undefined && { proxied }),
      },
    });

    await logActivity({
      userId,
      event: "DNS_UPDATED",
      metadata: { id, content, ttl, priority, proxied },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ record: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update DNS record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const record = await prisma.dnsRecord.findFirst({
    where: { id, subdomain: { userId } },
  });

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (record.cloudflareId) {
      await deleteDnsRecord(record.cloudflareId);
    }

    await prisma.dnsRecord.delete({ where: { id } });

    await logActivity({
      userId,
      event: "DNS_DELETED",
      metadata: { id, type: record.type, name: record.name },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete DNS record";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

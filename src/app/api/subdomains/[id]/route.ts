import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDnsRecord, deleteDnsRecord } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";
import { getUserId } from "@/lib/get-user-id";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const subdomain = await prisma.subdomain.findFirst({
    where: { id, userId },
    include: { dnsRecords: true },
  });

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ subdomain });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { target, proxied, type } = await req.json();

  const subdomain = await prisma.subdomain.findFirst({
    where: { id, userId },
  });

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (subdomain.cloudflareId) {
      await updateDnsRecord(subdomain.cloudflareId, {
        type: type ?? subdomain.type,
        name: subdomain.name,
        content: target ?? subdomain.target,
        proxied: proxied ?? subdomain.proxied,
        ttl: 1,
      });
    }

    const updated = await prisma.subdomain.update({
      where: { id },
      data: {
        ...(target !== undefined && { target }),
        ...(proxied !== undefined && { proxied }),
        ...(type !== undefined && { type }),
      },
    include: { dnsRecords: true },
    });

    await logActivity({
      userId,
      event: "SUBDOMAIN_UPDATED",
      metadata: { id, name: subdomain.name, target, proxied, type },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ subdomain: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update subdomain";
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

  const subdomain = await prisma.subdomain.findFirst({
    where: { id, userId },
    include: { dnsRecords: true },
  });

  if (!subdomain) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    if (subdomain.cloudflareId) {
        await deleteDnsRecord(subdomain.cloudflareId);
    }

    for (const record of subdomain.dnsRecords) {
      if (record.cloudflareId) {
        await deleteDnsRecord(record.cloudflareId);
      }
    }

    await prisma.dnsRecord.deleteMany({ where: { subdomainId: id } });
    await prisma.subdomain.delete({ where: { id } });

    await logActivity({
      userId,
      event: "SUBDOMAIN_DELETED",
      metadata: { id, name: subdomain.name },
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete subdomain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

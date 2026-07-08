import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/get-user-id";
import { getCustomDomains, addCustomDomain } from "@/lib/custom-domains";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const domains = await getCustomDomains(userId);
  const data = domains.map((d: any) => ({
    id: d.id,
    userId: d.user_id,
    domain: d.domain,
    subdomainId: d.subdomain_id,
    verificationToken: d.verification_token,
    verificationStatus: d.verification_status,
    sslStatus: d.ssl_status,
    subdomainName: d.subdomains?.name || null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }));
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { domain, subdomainId } = await req.json();
  if (!domain || typeof domain !== "string") {
    return NextResponse.json(
      { error: "Domain is required" },
      { status: 400 }
    );
  }
  const result = await addCustomDomain(userId, domain, subdomainId || null);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
}

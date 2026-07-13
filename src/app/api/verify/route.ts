import { NextRequest, NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const certId = req.nextUrl.searchParams.get("cert");
    if (!certId) {
      return NextResponse.json({ error: "Missing cert parameter" }, { status: 400 });
    }

    if (!supabaseAnon) {
      return NextResponse.json({ error: "Verification service unavailable" }, { status: 503 });
    }

    const { data: cert, error } = await supabaseAnon
      .from("certificates")
      .select("*")
      .eq("cert_id", certId)
      .single();

    if (error || !cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const payload = {
      subdomain: cert.subdomain_name,
      domain: cert.domain,
      fullDomain: cert.full_domain,
      target: cert.target,
      status: cert.status,
      dnsMode: cert.dns_mode,
      ownerId: cert.subdomain_id,
      issuedAt: new Date(cert.issued_at).toISOString(),
      issuer: "SubDNS",
    };

    const signingKey = process.env.CLOUDFLARE_API_TOKEN || process.env.SECRET_KEY || "subdns-default-key";
    const encoder = new TextEncoder();
    const messageData = encoder.encode(JSON.stringify(payload));
    const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(signingKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const computedSig = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const valid = computedSig === cert.signature;

    return NextResponse.json({
      valid,
      certificate: {
        certId: cert.cert_id,
        ownerName: cert.owner_name,
        ownerEmail: cert.owner_email,
        subdomain: cert.subdomain_name,
        domain: cert.domain,
        fullDomain: cert.full_domain,
        target: cert.target,
        status: cert.status,
        dnsMode: cert.dns_mode,
      issuedAt: new Date(cert.issued_at).toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Verify error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || "Verification failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { headers } from "next/headers";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// pdfkit + fs need the Node.js runtime (this route won't work on Edge)
export const runtime = "nodejs";

// ---- formal certificate palette: navy ink + muted bronze accent on parchment ----
const ink = "#1c2541";
const inkSoft = "#5b6478";
const inkFaint = "#8b93a6";
const bronze = "#a9812f";
const line = "#d8dbe4";
const paper = "#fffdf8";

const statusStyles: Record<string, { fg: string }> = {
  ACTIVE: { fg: "#1e7a3d" },
  PENDING: { fg: "#a9670f" },
  INACTIVE: { fg: "#5b6478" },
  FAILED: { fg: "#b0322a" },
};

function fmt(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// Loaded once per cold start; logo lives at /public/brand/m2h-logo.jpg
let logoBuffer: Buffer | null = null;
try {
  logoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "brand", "m2h-logo.jpg"));
} catch {
  logoBuffer = null; // certificate still renders fine without it
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: subdomain, error: subErr } = await supabase
      .from("subdomains")
      .select("name, domain, target, dns_mode, status, created_at")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (subErr || !subdomain) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", userId)
      .single();

    const fullDomain = `${subdomain.name}.${subdomain.domain}`;
    const issuedAt = new Date();
    const certId = `CERT-${subdomain.name}-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
    const ownerName = user?.name || "Account Holder";

    const payload = {
      subdomain: subdomain.name,
      domain: subdomain.domain,
      fullDomain,
      target: subdomain.target,
      status: subdomain.status,
      dnsMode: subdomain.dns_mode,
      ownerId: id,
      issuedAt: issuedAt.toISOString(),
      issuer: "SubDNS",
    };

    const signingKey = process.env.CLOUDFLARE_API_TOKEN || process.env.SECRET_KEY || "subdns-default-key";
    const encoder = new TextEncoder();
    const messageData = encoder.encode(JSON.stringify(payload));
    const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(signingKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const signature = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const sigShort = `${signature.slice(0, 16)} … ${signature.slice(-16)}`;

    const { error: insertErr } = await supabase.from("certificates").insert({
      cert_id: certId,
      owner_name: ownerName,
      owner_email: user?.email || null,
      subdomain_id: id,
      subdomain_name: subdomain.name,
      domain: subdomain.domain,
      full_domain: fullDomain,
      target: subdomain.target,
      status: subdomain.status,
      dns_mode: subdomain.dns_mode,
      signature,
      issued_at: issuedAt.toISOString(),
    });

    if (insertErr) {
      console.error("Certificate insert error:", insertErr);
    }

    const headersList = await headers();
    const host = headersList.get("host") || "subdns.m2hio.in";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;
    const verifyUrl = `${baseUrl}/verify?cert=${encodeURIComponent(certId)}`;

    // landscape — the proportions read as a certificate, not a letter
    const doc = new PDFDocument({ margin: 0, size: "A4", layout: "landscape" });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    const pdf = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      try {
        const PAGE_W = doc.page.width;   // 841.89
        const PAGE_H = doc.page.height;  // 595.28
        const cx = PAGE_W / 2;
        const L = 90;
        const R = PAGE_W - 90;
        const CW = R - L;

        // ---- parchment background ----
        doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(paper).fill();

        // ---- frame: outer bronze rule + inner hairline ----
        doc.lineWidth(1.2).strokeColor(bronze).rect(24, 24, PAGE_W - 48, PAGE_H - 48).stroke();
        doc.lineWidth(0.5).strokeColor(line).rect(30, 30, PAGE_W - 60, PAGE_H - 60).stroke();

        // corner flourishes
        const cLen = 16;
        const corners: [number, number, number, number][] = [
          [40, 40, 1, 1], [PAGE_W - 40, 40, -1, 1],
          [40, PAGE_H - 40, 1, -1], [PAGE_W - 40, PAGE_H - 40, -1, -1],
        ];
        corners.forEach(([px, py, dx, dy]) => {
          doc.lineWidth(1).strokeColor(bronze);
          doc.moveTo(px, py).lineTo(px + cLen * dx, py).stroke();
          doc.moveTo(px, py).lineTo(px, py + cLen * dy).stroke();
        });

        // ---- brand mark (M2H Web Solution logo, falls back to a drawn roundel) ----
        const logoSize = 70;
        const logoTop = 35;
        if (logoBuffer) {
          // circular clip so the square jpg reads as a mark, not a tile
          doc.save();
          doc.circle(cx, logoTop + logoSize / 2, logoSize / 2).clip();
          doc.image(logoBuffer, cx - logoSize / 2, logoTop, { width: logoSize, height: logoSize });
          doc.restore();
          doc.lineWidth(1).strokeColor(bronze).circle(cx, logoTop + logoSize / 2, logoSize / 2).stroke();
        } else {
          doc.lineWidth(1).strokeColor(bronze).circle(cx, logoTop + logoSize / 2, logoSize / 2).stroke();
          doc.fontSize(16).font("Times-Bold").fillColor(ink)
            .text("S", cx - logoSize / 2, logoTop + logoSize / 2 - 8, { width: logoSize, align: "center" });
        }

        doc.fontSize(8).font("Helvetica-Bold").fillColor(bronze)
          .text("S U B D N S", L, 114, { width: CW, align: "center", characterSpacing: 1 });
        doc.fontSize(7.5).font("Helvetica").fillColor(inkFaint)
          .text("DOMAIN OWNERSHIP REGISTRY", L, 126, { width: CW, align: "center", characterSpacing: 1.5 });

        // ---- title ----
        doc.fontSize(25).font("Times-Bold").fillColor(ink)
          .text("Certificate of Subdomain Ownership", L, 146, { width: CW, align: "center" });

        // ---- ornamental divider ----
        const divY = 186;
        doc.lineWidth(0.75).strokeColor(bronze);
        doc.moveTo(cx - 110, divY).lineTo(cx - 16, divY).stroke();
        doc.moveTo(cx + 16, divY).lineTo(cx + 110, divY).stroke();
        doc.save();
        doc.translate(cx, divY).rotate(45);
        doc.rect(-4, -4, 8, 8).fillColor(bronze).fill();
        doc.restore();

        // ---- certifying statement ----
        doc.fontSize(11).font("Times-Italic").fillColor(inkSoft)
          .text("This is to certify that", L, 204, { width: CW, align: "center" });

        doc.fontSize(16).font("Times-Bold").fillColor(ink)
          .text(ownerName, L, 223, { width: CW, align: "center" });

        doc.fontSize(11).font("Times-Italic").fillColor(inkSoft)
          .text("is the registered and verified owner of the subdomain", L, 248, { width: CW, align: "center" });

        doc.fontSize(25).font("Times-Bold").fillColor(ink)
          .text(fullDomain, L, 270, { width: CW, align: "center" });

        doc.lineWidth(1).strokeColor(bronze)
          .moveTo(cx - 80, 306).lineTo(cx + 80, 306).stroke();

        // ---- details band ----
        const bandY = 322;
        const bandH = 46;
        doc.lineWidth(0.5).strokeColor(line);
        doc.moveTo(L, bandY).lineTo(R, bandY).stroke();
        doc.moveTo(L, bandY + bandH).lineTo(R, bandY + bandH).stroke();

        const colW = CW / 4;
        function detail(i: number, label: string, value: string, color = ink) {
          const x = L + colW * i;
          doc.fontSize(7.5).font("Helvetica-Bold").fillColor(inkFaint)
            .text(label.toUpperCase(), x, bandY + 8, { width: colW, align: "center", characterSpacing: 0.5 });
          doc.fontSize(10.5).font("Helvetica-Bold").fillColor(color)
            .text(value, x, bandY + 21, { width: colW, align: "center" });
        }

        detail(0, "Parent Domain", subdomain.domain);
        detail(1, "Target", subdomain.target || "—");
        detail(2, "DNS Mode", subdomain.dns_mode);
        const st = statusStyles[subdomain.status as string] || statusStyles.INACTIVE;
        detail(3, "Status", subdomain.status, st.fg);

        // ---- signature / seal / date row ----
        const sigY = bandY + bandH + 34;

        // certificate no. — left
        doc.fontSize(11).font("Courier-Bold").fillColor(ink)
          .text(certId, L, sigY, { width: 200, align: "center" });
        doc.lineWidth(0.75).strokeColor(inkFaint)
          .moveTo(L + 20, sigY + 18).lineTo(L + 180, sigY + 18).stroke();
        doc.fontSize(7.5).font("Helvetica-Bold").fillColor(inkFaint)
          .text("CERTIFICATE NO.", L, sigY + 23, { width: 200, align: "center", characterSpacing: 0.5 });

        // official seal — center
        const sealC = { x: cx, y: sigY + 12, r: 32 };

        // laurel accents flanking the seal
        function laurel(side: 1 | -1) {
          const baseX = sealC.x + side * (sealC.r + 6);
          for (let i = 0; i < 4; i++) {
            const t = i / 3;
            const ly = sealC.y - 14 + t * 30;
            const spread = 10 + t * 4;
            doc.save();
            doc.lineWidth(0.75).strokeColor(bronze);
            doc.moveTo(baseX, sealC.y + 16)
              .quadraticCurveTo(baseX + side * spread * 0.6, ly, baseX + side * spread, ly - 2)
              .stroke();
            doc.restore();
          }
        }
        laurel(-1);
        laurel(1);

        // double ring
        doc.lineWidth(1.4).strokeColor(bronze).circle(sealC.x, sealC.y, sealC.r).stroke();
        doc.lineWidth(0.5).strokeColor(bronze).circle(sealC.x, sealC.y, sealC.r - 6).stroke();

        // small 5-point star, centered
        function starPoints(ox: number, oy: number, outerR: number, innerR: number) {
          const pts: [number, number][] = [];
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = -Math.PI / 2 + (i * Math.PI) / 5;
            pts.push([ox + r * Math.cos(angle), oy + r * Math.sin(angle)]);
          }
          return pts;
        }
        doc.polygon(...starPoints(sealC.x, sealC.y - 3, 7, 3)).fillColor(bronze).fill();

        // stacked labels, clear of the ring and the star
        doc.fontSize(6.5).font("Helvetica-Bold").fillColor(bronze)
          .text("SUBDNS", sealC.x - sealC.r, sealC.y - sealC.r + 10, { width: sealC.r * 2, align: "center", characterSpacing: 1 });
        doc.fontSize(7.5).font("Times-Bold").fillColor(bronze)
          .text("VERIFIED", sealC.x - sealC.r, sealC.y + 10, { width: sealC.r * 2, align: "center", characterSpacing: 0.5 });

        // date issued — right
        const rightColX = R - 200;
        doc.fontSize(11).font("Times-Bold").fillColor(ink)
          .text(fmt(issuedAt), rightColX, sigY, { width: 200, align: "center" });
        doc.lineWidth(0.75).strokeColor(inkFaint)
          .moveTo(rightColX + 20, sigY + 18).lineTo(rightColX + 180, sigY + 18).stroke();
        doc.fontSize(7.5).font("Helvetica-Bold").fillColor(inkFaint)
          .text("DATE ISSUED", rightColX, sigY + 23, { width: 200, align: "center", characterSpacing: 0.5 });

        // ---- registered contact ----
        const contactY = sigY + 56;
        doc.fontSize(8.5).font("Helvetica").fillColor(inkSoft)
          .text(`Registered to  ${ownerName}${user?.email ? "  ·  " + user.email : ""}`, L, contactY, { width: CW, align: "center" });

        // ---- verification note ----
        doc.fontSize(8).font("Times-Italic").fillColor(inkFaint)
          .text("This certificate is cryptographically signed with HMAC-SHA256 and may be verified using the certificate number above.",
            L, contactY + 18, { width: CW, align: "center" });
        doc.fontSize(7.5).font("Courier").fillColor(bronze)
          .text(verifyUrl, L, contactY + 34, { width: CW, align: "center" });

        // ---- footer signature hash ----
        const footerY = PAGE_H - 46;
        doc.lineWidth(0.5).strokeColor(line).moveTo(L, footerY).lineTo(R, footerY).stroke();
        doc.fontSize(7).font("Courier").fillColor(inkFaint)
          .text(sigShort, L, footerY + 8, { width: CW, align: "center" });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ownership-${fullDomain}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Certificate error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/get-user-id";
import { PLANS, type PlanId } from "@/lib/plans";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";

const ML = 50;
const PW = 512;
const MR = 562;
const PC = "#1e40af";
const GC = "#6b7280";
const LB = "#f8fafc";
const BC = "#e5e7eb";
const DC = "#1f2937";

function addCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number) {
  doc.roundedRect(x, y, w, h, 6).fillColor(LB).fill();
  doc.roundedRect(x, y, w, h, 6).lineWidth(1).strokeColor(BC).stroke();
}

function addBadge(doc: PDFKit.PDFDocument, text: string, x: number, y: number, bg: string) {
  const pad = 14;
  const bh = 24;
  doc.fontSize(9).font("Helvetica-Bold");
  const bw = doc.widthOfString(text) + pad * 2;
  doc.roundedRect(x, y, bw, bh, 12).fillColor(bg).fill();
  doc.fillColor("#ffffff").text(text, x + pad, y + 7);
}

const statusBg: Record<string, string> = {
  ACTIVE: "#059669", PAID: "#059669", PENDING: "#d97706",
  FAILED: "#dc2626", CANCELLED: "#6b7280", EXPIRED: "#6b7280",
};

const statusLabel: Record<string, string> = {
  ACTIVE: "PAID", PAID: "PAID", PENDING: "PENDING",
  FAILED: "FAILED", CANCELLED: "CANCELLED", EXPIRED: "EXPIRED",
};

function fmt(d: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(d).toLocaleDateString("en-IN", opts || { year: "numeric", month: "long", day: "numeric" });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("order_id", orderId)
      .eq("user_id", userId)
      .single();

    if (error || !sub) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const { data: user } = await supabase
      .from("users")
      .select("name, email, created_at")
      .eq("id", userId)
      .single();

    const planName = PLANS[sub.plan as PlanId]?.name ?? sub.plan;
    const amount = sub.order_amount;
    const gstRate = 18;
    const gstAmount = Math.round(amount * gstRate / 100);
    const total = amount + gstAmount;

    const doc = new PDFDocument({ margin: ML, size: "A4" });
    const buffers: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => buffers.push(chunk));

    const pdf = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      try {
        // ===== HEADER =====
        const logoPath = path.join(process.cwd(), "M2HWebSolution.jpg");
        let logoHeight = 0;
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, ML, 30, { height: 50 });
            logoHeight = 50;
          } catch {}
        }

        doc.fontSize(28).font("Helvetica-Bold").fillColor(PC)
          .text("INVOICE", MR - 180, 30, { align: "right", width: 180 });

        const orderRef = `#${orderId.substring(0, 14).toUpperCase()}`;
        doc.fontSize(9).font("Helvetica").fillColor(GC)
          .text(orderRef, MR - 200, 60, { align: "right", width: 200 });

        const issueDate = fmt(sub.created_at, { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
        doc.fontSize(9).fillColor(GC)
          .text(`Issue Date: ${issueDate}`, MR - 200, 76, { align: "right", width: 200 });

        const dueDateRaw = new Date(new Date(sub.created_at).getTime() + 15 * 24 * 60 * 60 * 1000);
        const dueDate = fmt(dueDateRaw, { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Kolkata" });
        doc.fontSize(9).fillColor(GC)
          .text(`Due Date: ${dueDate}`, MR - 200, 92, { align: "right", width: 200 });

        addBadge(doc, statusLabel[sub.status] || sub.status, MR - 200 + 200 - 100, 114, statusBg[sub.status] || GC);

        // ===== DIVIDER =====
        const dividerPos = Math.max(logoHeight + 30 + 20, 150);
        doc.rect(ML, dividerPos, PW, 1).fillColor(BC).fill();

        // ===== FROM / BILL TO =====
        const cardY = dividerPos + 20;
        const cardH = 68;
        const cardW = (PW - 24) / 2;

        addCard(doc, ML, cardY, cardW, cardH);
        doc.fontSize(10).font("Helvetica-Bold").fillColor(PC).text("FROM", ML + 14, cardY + 10);
        doc.fontSize(10).font("Helvetica").fillColor(DC).text("M2H Web Solution", ML + 14, cardY + 28);
        doc.fontSize(9).fillColor(GC).text("support@m2hio.in", ML + 14, cardY + 46);

        const btx = ML + cardW + 24;
        addCard(doc, btx, cardY, cardW, cardH);
        doc.fontSize(10).font("Helvetica-Bold").fillColor(PC).text("BILL TO", btx + 14, cardY + 10);
        doc.fontSize(10).font("Helvetica").fillColor(DC).text(user?.name || "Customer", btx + 14, cardY + 28);
        doc.fontSize(9).fillColor(GC).text(user?.email || "", btx + 14, cardY + 46);

        // ===== SERVICE TABLE =====
        const tableY = cardY + cardH + 28;
        const col1 = { x: ML, w: 200 };
        const col2 = { x: ML + 200, w: 90 };
        const col3 = { x: ML + 290, w: 60 };
        const col4 = { x: ML + 350, w: 72 };
        const col5 = { x: ML + 422, w: 90 };

        const tHeadH = 24;
        doc.rect(ML, tableY, PW, tHeadH).fillColor(PC).fill();
        doc.fontSize(8).font("Helvetica-Bold").fillColor("#ffffff");
        doc.text("SERVICE", col1.x + 12, tableY + 7, { width: col1.w - 12 });
        doc.text("BILLING PERIOD", col2.x + 6, tableY + 7, { width: col2.w - 6 });
        doc.text("QTY", col3.x, tableY + 7, { width: col3.w, align: "center" });
        doc.text("UNIT PRICE", col4.x, tableY + 7, { width: col4.w, align: "right" });
        doc.text("SUBTOTAL", col5.x - 8, tableY + 7, { width: col5.w, align: "right" });

        const rowY = tableY + tHeadH;
        const rowH = 40;
        doc.rect(ML, rowY, PW, rowH).fillColor(LB).fill();
        doc.rect(ML, rowY, PW, rowH).lineWidth(0.5).strokeColor(BC).stroke();

        doc.fontSize(10).font("Helvetica-Bold").fillColor(DC);
        doc.text(`${planName} Plan`, col1.x + 12, rowY + 6, { width: col1.w - 12 });
        doc.fontSize(8).font("Helvetica").fillColor(GC);
        doc.text("Monthly subscription with premium DNS & subdomain management", col1.x + 12, rowY + 21, { width: col1.w - 12 });

        const pd = sub.paid_at ? new Date(sub.paid_at) : new Date(sub.created_at);
        const ps = pd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
        const pe = new Date(pd.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
        doc.fontSize(9).font("Helvetica").fillColor(DC);
        doc.text(`${ps} - ${pe}`, col2.x + 6, rowY + 6, { width: col2.w - 6 });

        const qty = "1";
        doc.fontSize(10).font("Helvetica").fillColor(DC);
        doc.text(qty, col3.x, rowY + 6, { width: col3.w, align: "center" });
        doc.text(`\u20B9${amount}`, col4.x, rowY + 6, { width: col4.w, align: "right" });
        doc.font("Helvetica-Bold");
        doc.text(`\u20B9${amount}`, col5.x - 8, rowY + 6, { width: col5.w, align: "right" });

        // ===== PAYMENT SUMMARY =====
        const summaryY = rowY + rowH + 24;
        const scw = 220;
        const scx = MR - scw;

        let sy = summaryY;
        doc.fontSize(10).font("Helvetica").fillColor(GC);
        doc.text("Subtotal:", scx, sy, { width: 100 });
        doc.fillColor(DC).text(`\u20B9${amount}`, scx + 100, sy, { width: scw - 100, align: "right" });

        sy += 20;
        doc.fontSize(10).font("Helvetica").fillColor(GC);
        doc.text(`GST (${gstRate}%):`, scx, sy, { width: 100 });
        doc.fillColor(DC).text(`\u20B9${gstAmount}`, scx + 100, sy, { width: scw - 100, align: "right" });

        sy += 20;
        doc.rect(scx, sy, scw, 1).fillColor(BC).fill();

        sy += 12;
        doc.fontSize(14).font("Helvetica-Bold").fillColor(PC);
        doc.text("Total:", scx, sy, { width: 100 });
        doc.text(`\u20B9${total}`, scx + 100, sy, { width: scw - 100, align: "right" });

        // ===== PAYMENT & SUBSCRIPTION DETAILS =====
        const payY = sy + 36;
        doc.rect(ML, payY - 2, PW, 1).fillColor(BC).fill();

        doc.fontSize(12).font("Helvetica-Bold").fillColor(PC);
        doc.text("Payment Details", ML, payY + 10);

        const detailY = payY + 34;
        const leftColX = ML;
        const rightColX = ML + 290;
        const labelW = 105;
        const valueW = 180;

        function addDetail(label: string, value: string, rowIndex: number) {
          const dy = detailY + rowIndex * 20;
          doc.fontSize(9).font("Helvetica").fillColor(GC);
          doc.text(label, leftColX, dy, { width: labelW });
          doc.fontSize(9).font("Helvetica-Bold").fillColor(DC);
          doc.text(value, leftColX + labelW, dy, { width: valueW });
        }

        function addDetailRight(label: string, value: string, rowIndex: number) {
          const dy = detailY + rowIndex * 20;
          doc.fontSize(9).font("Helvetica").fillColor(GC);
          doc.text(label, rightColX, dy, { width: labelW });
          doc.fontSize(9).font("Helvetica-Bold").fillColor(DC);
          doc.text(value, rightColX + labelW, dy, { width: valueW });
        }

        let detailIdx = 0;
        addDetail("Payment Method:", sub.paid_at ? "Online Payment (Cashfree)" : "—", detailIdx++);
        addDetail("Transaction ID:", sub.payment_session_id
          ? sub.payment_session_id.length > 22
            ? sub.payment_session_id.substring(0, 22) + "..."
            : sub.payment_session_id
          : "—", detailIdx++);
        addDetail("Payment Date:", sub.paid_at
          ? fmt(sub.paid_at, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })
          : "—", detailIdx++);

        detailIdx = 0;
        addDetailRight("Plan:", `${planName}`, detailIdx++);
        addDetailRight("Billing Cycle:", "Monthly", detailIdx++);
        addDetailRight("Next Renewal:", sub.paid_at
          ? new Date(new Date(sub.paid_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
          : "—", detailIdx++);

        // ===== FOOTER =====
        const footerY = doc.page.height - 80;
        doc.rect(ML, footerY, PW, 1).fillColor(BC).fill();
        doc.fontSize(9).font("Helvetica").fillColor(GC)
          .text("M2H Web Solution — support@m2hio.in", ML, footerY + 16, { align: "center", width: PW });
        doc.fontSize(8).fillColor(GC)
          .text("Payment is due within 15 days. Thank you for your business!", ML, footerY + 34, { align: "center", width: PW });
        doc.fontSize(7).fillColor(GC)
          .text(`Generated on ${new Date().toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" })}`, ML, footerY + 50, { align: "center", width: PW });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${orderId}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Invoice download error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

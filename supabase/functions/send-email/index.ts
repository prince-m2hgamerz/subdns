import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

Deno.serve(async (req) => {
  const { to, subject, html, text } = await req.json();

  if (!to || !subject) {
    return new Response(JSON.stringify({ error: "Missing required fields: to, subject" }), { status: 400 });
  }

  const { data, error } = await resend.emails.send({
    from: "SubDNS <noreply@m2hio.in>",
    to,
    subject,
    html: html || text,
  });

  if (error) {
    console.error("Resend error:", error);
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ data }), { status: 200 });
});

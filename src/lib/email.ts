import { supabase } from "./supabase";

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  const appName = process.env.APP_NAME || "SubDNS";

  const text = `Click the following link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
      <h2 style="margin-bottom:16px;">Reset your password</h2>
      <p style="color:#555;line-height:1.6;">
        Click the button below to reset your password. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0;">
        Reset Password
      </a>
      <p style="color:#999;font-size:12px;margin-top:24px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  const { error } = await supabase.functions.invoke("send-email", {
    body: { to: email, subject: `Reset your ${appName} password`, html, text },
  });

  if (error) {
    console.error("send-email edge function error:", error);
  }

  return !error;
}

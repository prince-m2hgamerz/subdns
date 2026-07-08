import { supabase } from "./supabase";

type EmailTemplate =
  | "onboarding"
  | "subdomain_created"
  | "dns_created"
  | "dns_updated"
  | "subdomain_down"
  | "account_banned"
  | "plan_changed"
  | "report_status"
  | "api_key_created";

type EmailData = Record<string, string | number | boolean | undefined>;

const appName = process.env.APP_NAME || "SubDNS";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://subdns.m2hio.in";

function getSubject(template: EmailTemplate, data: EmailData): string {
  const subjects: Record<EmailTemplate, string> = {
    onboarding: `Welcome to ${appName}!`,
    subdomain_created: `Subdomain Created: ${data.name}`,
    dns_created: `DNS Record Created: ${data.recordType} ${data.recordName}`,
    dns_updated: `DNS Record Updated: ${data.recordType} ${data.recordName}`,
    subdomain_down: `Uptime Alert: ${data.name} is DOWN`,
    account_banned: `Your ${appName} account has been suspended`,
    plan_changed: `Plan Updated: ${data.plan}`,
    report_status: `Report #${data.reportId} Status Update: ${data.status}`,
    api_key_created: `New API Key Created: ${data.keyName}`,
  };
  return subjects[template];
}

function buildHtml(template: EmailTemplate, data: EmailData): string {
  const blocks: Record<EmailTemplate, string> = {
    onboarding: `
      <h1>Welcome to ${appName}! 🚀</h1>
      <p>Hi${data.name ? ` ${data.name}` : ""},</p>
      <p>Your account has been created successfully. You can now start managing your subdomains and DNS records.</p>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          Go to Dashboard
        </a>
      </div>
      <p style="color:#666;">Need help? Check out our <a href="${baseUrl}/tutorials" style="color:#000;">tutorials</a>.</p>
    `,
    subdomain_created: `
      <h1>Subdomain Created</h1>
      <p>Your subdomain <strong>${data.name}.${data.domain}</strong> has been created successfully.</p>
      <div style="margin:24px 0;padding:16px;background:#f5f5f5;border-radius:8px;">
        <p style="margin:4px 0;"><strong>Subdomain:</strong> ${data.name}.${data.domain}</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/subdomains/${data.subdomainId}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          Manage Subdomain
        </a>
      </div>
    `,
    dns_created: `
      <h1>DNS Record Created</h1>
      <p>A new DNS record has been added to <strong>${data.subdomainName}</strong>.</p>
      <div style="margin:24px 0;padding:16px;background:#f5f5f5;border-radius:8px;">
        <p style="margin:4px 0;"><strong>Type:</strong> ${data.recordType}</p>
        <p style="margin:4px 0;"><strong>Name:</strong> ${data.recordName}</p>
        <p style="margin:4px 0;"><strong>Content:</strong> ${data.recordContent}</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/subdomains/${data.subdomainId}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          View Record
        </a>
      </div>
    `,
    dns_updated: `
      <h1>DNS Record Updated</h1>
      <p>The DNS record <strong>${data.recordType} ${data.recordName}</strong> on <strong>${data.subdomainName}</strong> has been updated.</p>
      <div style="margin:24px 0;padding:16px;background:#f5f5f5;border-radius:8px;">
        <p style="margin:4px 0;"><strong>New Content:</strong> ${data.recordContent}</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/subdomains/${data.subdomainId}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          View Record
        </a>
      </div>
    `,
    subdomain_down: `
      <h1>⚠️ Uptime Alert: Subdomain is DOWN</h1>
      <p>Your subdomain <strong>${data.name}.${data.domain}</strong> is currently not responding.</p>
      <div style="margin:24px 0;padding:16px;background:#fff0f0;border-radius:8px;border:1px solid #ffcccc;">
        <p style="margin:4px 0;"><strong>Subdomain:</strong> ${data.name}.${data.domain}</p>
        <p style="margin:4px 0;"><strong>Status Code:</strong> ${data.statusCode}</p>
        <p style="margin:4px 0;"><strong>Time:</strong> ${data.checkedAt}</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/uptime" style="display:inline-block;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          Check Uptime Dashboard
        </a>
      </div>
    `,
    account_banned: `
      <h1>Account Suspended</h1>
      <p>Your ${appName} account has been suspended.</p>
      <p style="color:#666;">If you believe this is a mistake, please contact our support team to resolve the issue.</p>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/contact" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          Contact Support
        </a>
      </div>
    `,
    plan_changed: `
      <h1>Plan Updated to ${data.plan}</h1>
      <p>Your subscription plan has been updated to <strong>${data.plan}</strong>.</p>
      <div style="margin:24px 0;padding:16px;background:#f5f5f5;border-radius:8px;">
        <p style="margin:4px 0;"><strong>Previous Plan:</strong> ${data.oldPlan}</p>
        <p style="margin:4px 0;"><strong>New Plan:</strong> ${data.plan}</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/upgrade" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          View Plan Details
        </a>
      </div>
    `,
    report_status: `
      <h1>Report #${data.reportId} Status Update</h1>
      <p>The status of your report has been updated.</p>
      <div style="margin:24px 0;padding:16px;background:#f5f5f5;border-radius:8px;">
        <p style="margin:4px 0;"><strong>Report ID:</strong> #${data.reportId}</p>
        <p style="margin:4px 0;"><strong>Subject:</strong> ${data.reportSubject}</p>
        <p style="margin:4px 0;"><strong>Status:</strong> ${data.status}</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/reports" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          View Reports
        </a>
      </div>
    `,
    api_key_created: `
      <h1>New API Key Created</h1>
      <p>A new API key named <strong>${data.keyName}</strong> was created for your account.</p>
      <p style="color:#666;font-size:14px;">If you did not create this key, please revoke it immediately and change your password.</p>
      <div style="margin:24px 0;">
        <a href="${baseUrl}/dashboard/api-keys" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
          Manage API Keys
        </a>
      </div>
    `,
  };

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f9f9f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:24px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <tr>
                <td style="padding:32px 40px 0 40px;border-bottom:1px solid #eee;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h2 style="margin:0;font-size:20px;color:#000;">${appName}</h2>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;font-size:15px;line-height:1.6;color:#333;">
                  ${blocks[template]}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px;background:#f5f5f5;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;">
                  <p style="margin:0 0 4px 0;">${appName} &mdash; Subdomain Management Platform</p>
                  <p style="margin:0;">
                    <a href="${baseUrl}" style="color:#999;text-decoration:underline;">${baseUrl}</a>
                    &nbsp;·&nbsp;
                    <a href="${baseUrl}/dashboard/settings/notifications" style="color:#999;text-decoration:underline;">Notification Settings</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const { error } = await supabase.functions.invoke("send-email", {
    body: { to, subject, html, text },
  });
  if (error) {
    console.error("send-email edge function error:", error);
    return false;
  }
  return true;
}

export async function sendNotificationEmail(
  to: string,
  template: EmailTemplate,
  data: EmailData,
): Promise<boolean> {
  const subject = getSubject(template, data);
  const html = buildHtml(template, data);
  return sendEmail(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  const subject = `Reset your ${appName} password`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f9f9f9;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:24px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <tr>
                <td style="padding:32px 40px 0 40px;border-bottom:1px solid #eee;">
                  <h2 style="margin:0;font-size:20px;color:#000;">${appName}</h2>
                </td>
              </tr>
              <tr>
                <td style="padding:32px 40px;font-size:15px;line-height:1.6;color:#333;">
                  <h1>Reset Your Password</h1>
                  <p>You requested a password reset for your ${appName} account.</p>
                  <p>Click the button below to reset your password. This link expires in 1 hour.</p>
                  <div style="margin:24px 0;">
                    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:500;">
                      Reset Password
                    </a>
                  </div>
                  <p style="color:#666;font-size:14px;">If you did not request this, you can safely ignore this email.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px;background:#f5f5f5;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee;">
                  <p style="margin:0;">${appName} &mdash; Subdomain Management Platform</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmail(to, subject, html);
}

export { sendEmail };

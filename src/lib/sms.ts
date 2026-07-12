const SMSGATE_LOGIN = "ADJN6P";
const SMSGATE_PASSWORD = "_2i9az-y3iwlnp";
const SMSGATE_API_BASE = "https://sms-api.m2hio.in";

export async function sendSms(phone: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${SMSGATE_API_BASE}/api/3rdparty/v1/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${SMSGATE_LOGIN}:${SMSGATE_PASSWORD}`).toString("base64")}`,
        },
        body: JSON.stringify({
          textMessage: { text: message },
          phoneNumbers: [phone],
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export function isPlaceholderEmail(email: string): boolean {
  return /^phone_\d+@subdns\.m2hio\.in$/.test(email);
}

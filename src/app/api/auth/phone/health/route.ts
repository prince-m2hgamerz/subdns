import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://sms-api.m2hio.in/health", {
      signal: AbortSignal.timeout(5000),
    });
    return NextResponse.json({ available: response.ok });
  } catch {
    return NextResponse.json({ available: false });
  }
}

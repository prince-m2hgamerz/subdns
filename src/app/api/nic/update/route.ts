import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/api/ddns/update";
  return Response.redirect(url.toString(), 307);
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/api/ddns/update";
  return Response.redirect(url.toString(), 307);
}

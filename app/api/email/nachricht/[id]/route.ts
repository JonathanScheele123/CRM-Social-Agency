import { auth } from "@/auth";
import { google, gmail_v1 } from "googleapis";
import { NextRequest } from "next/server";

function gmailClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  );
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth: oauth2 });
}

function extractHtml(payload: gmail_v1.Schema$MessagePart | null | undefined): string {
  if (!payload) return "";
  if (payload.mimeType === "text/html" && payload.body?.data)
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  for (const part of payload.parts ?? []) {
    const r = extractHtml(part);
    if (r) return r;
  }
  return "";
}

function extractText(payload: gmail_v1.Schema$MessagePart | null | undefined): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data)
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  for (const part of payload.parts ?? []) {
    const r = extractText(part);
    if (r) return r;
  }
  return "";
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const gmail = gmailClient();

  try {
    const msg = await gmail.users.messages.get({ userId: "me", id, format: "full" });
    const html = extractHtml(msg.data.payload);
    const text = extractText(msg.data.payload);
    return Response.json({ html, text, isHtml: !!html });
  } catch (e) {
    console.error("[email/nachricht]", e);
    return Response.json({ fehler: "Nachricht nicht gefunden." }, { status: 404 });
  }
}

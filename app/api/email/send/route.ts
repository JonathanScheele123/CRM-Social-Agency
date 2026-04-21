import { auth } from "@/auth";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });

  let body: { to: string | string[]; subject: string; html: string; text?: string; replyTo?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ fehler: "Ungültiger Request." }, { status: 400 });
  }

  const { to, subject, html, text, replyTo } = body;
  if (!to || !subject || !html) {
    return Response.json({ fehler: "to, subject und html sind erforderlich." }, { status: 400 });
  }

  try {
    await sendEmail({ to, subject, html, text: text ?? "", replyTo });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[email/send]", e);
    return Response.json({ fehler: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
  }
}

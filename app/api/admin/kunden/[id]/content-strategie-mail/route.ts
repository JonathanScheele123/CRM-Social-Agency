import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { contentStrategieEmailHtml } from "@/lib/content-strategie-email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN")
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });

  const { id } = await params;
  const { email } = await req.json();

  if (!email?.trim())
    return Response.json({ fehler: "E-Mail-Adresse fehlt." }, { status: 400 });

  const kunde = await prisma.kundenprofil.findUnique({
    where: { id },
    select: { unternehmensname: true, freigabeVerantwortlicher: true, emailFreigabeVerantwortlicher: true },
  });
  if (!kunde) return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });

  const base = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");
  const formularLink = `${base}/formular/content-strategie/${id}`;
  const unternehmensname = kunde.unternehmensname ?? "Ihrem Unternehmen";
  const name = email.trim() === kunde.emailFreigabeVerantwortlicher?.trim()
    ? (kunde.freigabeVerantwortlicher || email.trim())
    : email.trim();

  const html = contentStrategieEmailHtml({ name, unternehmensname, formularLink });
  const text = `Hallo ${name},\n\nBitte füllen Sie das Content-Strategie-Formular aus:\n\n${formularLink}\n\nDas Formular dauert ca. 10–15 Minuten.\n\nBei Fragen antworten Sie einfach auf diese E-Mail.\n\nJonathan Scheele · JS Media`;

  try {
    await sendEmail({
      to: email.trim(),
      subject: `Ihre Content-Strategie für ${unternehmensname} – bitte ausfüllen`,
      html,
      text,
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[content-strategie-mail]", e);
    return Response.json({ fehler: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
  }
}

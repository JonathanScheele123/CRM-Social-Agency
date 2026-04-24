import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { feedbackEmailHtml } from "@/lib/feedback-email";

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
    select: {
      unternehmensname: true,
      ansprechpartner: true,
      emailAnsprechpartner: true,
      freigabeVerantwortlicher: true,
      emailFreigabeVerantwortlicher: true,
      freigabeVerantwortlicher2: true,
      emailFreigabeVerantwortlicher2: true,
    },
  });
  if (!kunde) return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });

  const base = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");
  const feedbackLink = `${base}/formular/feedback/${id}`;
  const unternehmensname = kunde.unternehmensname ?? "Ihrem Unternehmen";

  const nameMap: Record<string, string> = {};
  if (kunde.emailAnsprechpartner) nameMap[kunde.emailAnsprechpartner.trim().toLowerCase()] = kunde.ansprechpartner ?? "";
  if (kunde.emailFreigabeVerantwortlicher) nameMap[kunde.emailFreigabeVerantwortlicher.trim().toLowerCase()] = kunde.freigabeVerantwortlicher ?? "";
  if (kunde.emailFreigabeVerantwortlicher2) nameMap[kunde.emailFreigabeVerantwortlicher2.trim().toLowerCase()] = kunde.freigabeVerantwortlicher2 ?? "";

  const name = nameMap[email.trim().toLowerCase()] || email.trim();

  const html = feedbackEmailHtml({ name, unternehmensname, feedbackLink });
  const text = `Hallo ${name},\n\nWir möchten wissen, wie Sie unsere Zusammenarbeit erleben. Bitte nehmen Sie sich kurz Zeit für Ihr Feedback:\n\n${feedbackLink}\n\nVielen Dank für Ihr Vertrauen.\n\nJonathan Scheele · JS Media`;

  try {
    await sendEmail({
      to: email.trim(),
      subject: `Ihr Feedback zu ${unternehmensname} – JS Media`,
      html,
      text,
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[feedback-mail]", e);
    return Response.json({ fehler: "E-Mail konnte nicht gesendet werden." }, { status: 500 });
  }
}

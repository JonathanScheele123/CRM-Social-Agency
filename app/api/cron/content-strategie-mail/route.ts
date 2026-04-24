import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { contentStrategieEmailHtml } from "@/lib/content-strategie-email";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const base = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");

  // Profile die vor 24–48h erstellt wurden, noch kein Strategie-Mail haben,
  // und eine Freigabe-E-Mail-Adresse besitzen.
  const vor24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const vor48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const profile = await prisma.kundenprofil.findMany({
    where: {
      createdAt: { lte: vor24h, gte: vor48h },
      contentStrategieMailGesendet: null,
      emailFreigabeVerantwortlicher: { not: null },
    },
    select: {
      id: true,
      unternehmensname: true,
      freigabeVerantwortlicher: true,
      emailFreigabeVerantwortlicher: true,
    },
  });

  let gesendet = 0;
  let fehler = 0;

  for (const profil of profile) {
    const email = profil.emailFreigabeVerantwortlicher!;
    const name = profil.freigabeVerantwortlicher || email;
    const unternehmensname = profil.unternehmensname ?? "Ihrem Unternehmen";
    const formularLink = `${base}/formular/content-strategie/${profil.id}`;

    const html = contentStrategieEmailHtml({ name, unternehmensname, formularLink });
    const text = `Hallo ${name},\n\nIhre Zusammenarbeit mit JS Media hat begonnen. Bitte füllen Sie das Content-Strategie-Formular aus:\n\n${formularLink}\n\nDas Formular dauert ca. 10–15 Minuten.\n\nBei Fragen antworten Sie einfach auf diese E-Mail.\n\nJonathan Scheele · JS Media`;

    try {
      await sendEmail({
        to: email,
        subject: `Ihre Content-Strategie für ${unternehmensname} – bitte ausfüllen`,
        html,
        text,
      });
      gesendet++;
    } catch (e) {
      console.error(`[content-strategie-mail] Fehler bei ${email}:`, e);
      fehler++;
    }

    await prisma.kundenprofil.update({
      where: { id: profil.id },
      data: { contentStrategieMailGesendet: new Date() },
    });
  }

  return Response.json({ verarbeitet: profile.length, gesendet, fehler });
}

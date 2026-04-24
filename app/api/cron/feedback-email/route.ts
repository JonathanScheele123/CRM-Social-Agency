import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { feedbackEmailHtml } from "@/lib/feedback-email";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const base = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");

  const dreiMonateHer = new Date();
  dreiMonateHer.setMonth(dreiMonateHer.getMonth() - 3);

  const profile = await prisma.kundenprofil.findMany({
    where: {
      createdAt: { lte: dreiMonateHer },
      feedbackEmailGesendetAm: null,
      keinMarketing: false,
    },
    select: {
      id: true,
      unternehmensname: true,
      zugriffe: {
        select: {
          user: {
            select: { name: true, email: true, aktiv: true },
          },
        },
      },
    },
  });

  let gesamtGesendet = 0;
  let gesamtFehler = 0;

  for (const profil of profile) {
    const unternehmensname = profil.unternehmensname ?? "Ihrem Unternehmen";
    const feedbackLink = `${base}/formular/feedback/${profil.id}`;

    for (const zugriff of profil.zugriffe) {
      const user = zugriff.user;
      if (!user.aktiv) continue;

      const name = user.name || user.email;
      const html = feedbackEmailHtml({ name, unternehmensname, feedbackLink });
      const text = `Hallo ${name},\n\nunsere Zusammenarbeit mit ${unternehmensname} läuft nun seit drei Monaten. Wir würden uns sehr über Ihr Feedback freuen:\n\n${feedbackLink}\n\nVielen Dank,\nJonathan Scheele · JS Media`;

      try {
        await sendEmail({
          to: user.email,
          subject: `Wie läuft unsere Zusammenarbeit? – Feedback nach 3 Monaten`,
          html,
          text,
        });
        gesamtGesendet++;
      } catch (e) {
        console.error(`[feedback-email] Fehler bei ${user.email}:`, e);
        gesamtFehler++;
      }
    }

    await prisma.kundenprofil.update({
      where: { id: profil.id },
      data: { feedbackEmailGesendetAm: new Date() },
    });
  }

  return Response.json({
    verarbeitet: profile.length,
    gesendet: gesamtGesendet,
    fehler: gesamtFehler,
  });
}

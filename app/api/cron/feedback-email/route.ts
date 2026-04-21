import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import fs from "fs";
import path from "path";

function feedbackHtml(name: string, unternehmen: string, feedbackUrl: string): string {
  const tplPath = path.join(process.cwd(), "public", "email-feedback.html");
  let html = fs.readFileSync(tplPath, "utf-8");
  const base = (process.env.NEXTAUTH_URL ?? "https://app.js-media.de").replace(/\/$/, "");
  html = html.replace("{{BASE_URL}}", base);
  html = html.replace("{{NAME}}", name);
  html = html.replace("{{UNTERNEHMEN}}", unternehmen);
  html = html.replace(/\{\{FEEDBACK_URL\}\}/g, feedbackUrl);
  return html;
}

export async function GET(req: NextRequest) {
  // Cron-Secret prüfen
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const base = (process.env.NEXTAUTH_URL ?? "https://app.js-media.de").replace(/\/$/, "");

  // Alle Profile die vor ca. 3 Monaten erstellt wurden und noch kein Feedback-Mail bekommen haben
  const dreiMonateHer = new Date();
  dreiMonateHer.setMonth(dreiMonateHer.getMonth() - 3);

  // Fenster: createdAt liegt zwischen 3 Monate + 1 Tag und 3 Monate (exakt gestern bis übermorgen)
  // Wir prüfen: createdAt <= vor 3 Monaten AND noch nicht gesendet
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

  const ergebnisse: { kundenprofilId: string; gesendetAn: string[]; fehler: string[] } = {
    kundenprofilId: "",
    gesendetAn: [],
    fehler: [],
  };

  let gesamtGesendet = 0;
  let gesamtFehler = 0;

  for (const profil of profile) {
    const unternehmen = profil.unternehmensname ?? "Ihrem Unternehmen";
    const feedbackUrl = `${base}/formular/feedback/${profil.id}`;
    const gesendetAn: string[] = [];
    const fehler: string[] = [];

    for (const zugriff of profil.zugriffe) {
      const user = zugriff.user;
      if (!user.aktiv) continue;

      const name = user.name || user.email;
      const html = feedbackHtml(name, unternehmen, feedbackUrl);
      const text = `Hallo ${name},\n\nunsere Zusammenarbeit mit ${unternehmen} läuft nun seit drei Monaten. Wir würden uns sehr über Ihr Feedback freuen:\n\n${feedbackUrl}\n\nVielen Dank,\nJonathan Scheele · JS Media`;

      try {
        await sendEmail({
          to: user.email,
          subject: `Wie läuft unsere Zusammenarbeit? – Feedback nach 3 Monaten`,
          html,
          text,
        });
        gesendetAn.push(user.email);
        gesamtGesendet++;
      } catch (e) {
        console.error(`[feedback-email] Fehler bei ${user.email}:`, e);
        fehler.push(user.email);
        gesamtFehler++;
      }
    }

    // Als gesendet markieren (auch wenn einzelne Adressen fehlgeschlagen)
    await prisma.kundenprofil.update({
      where: { id: profil.id },
      data: { feedbackEmailGesendetAm: new Date() },
    });

    ergebnisse.kundenprofilId = profil.id;
    ergebnisse.gesendetAn = gesendetAn;
    ergebnisse.fehler = fehler;
  }

  return Response.json({
    verarbeitet: profile.length,
    gesendet: gesamtGesendet,
    fehler: gesamtFehler,
  });
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { kalenderEmailHtml } from "@/lib/kalender-email";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { kundenprofilId } = await req.json();
  if (!kundenprofilId) {
    return Response.json({ fehler: "kundenprofilId fehlt." }, { status: 400 });
  }

  const ideen = await prisma.contentIdea.findMany({
    where: {
      kundenprofilId,
      status: "Angenommen",
      captionText: { not: null },
      gewuenschtesPostingDatum: { not: null },
    },
  });

  if (ideen.length === 0) {
    return Response.json({ fehler: "Keine fertigen Ideen vorhanden." }, { status: 400 });
  }

  const ids = ideen.map(i => i.id);

  await Promise.all([
    ...ideen.map(idee =>
      prisma.kalenderEintrag.create({
        data: {
          kundenprofilId: idee.kundenprofilId,
          titel: idee.titel,
          beschreibung: idee.beschreibung,
          plattform: idee.plattform,
          contentTyp: idee.contentTyp,
          prioritaet: idee.prioritaet,
          captionText: idee.captionText,
          dateizugriff: idee.dateizugriff,
          notizen: idee.notizen,
          geplantAm: idee.gewuenschtesPostingDatum!,
          freigabeStatus: "Freigegeben",
          gepostet: false,
        },
      })
    ),
    ...ideen.map(idee =>
      prisma.archivEintrag.create({
        data: {
          kundenprofilId: idee.kundenprofilId,
          titel: idee.titel,
          beschreibung: idee.beschreibung,
          plattform: idee.plattform,
          contentTyp: idee.contentTyp,
          prioritaet: idee.prioritaet,
          captionText: idee.captionText,
          dateizugriff: idee.dateizugriff,
          notizen: idee.notizen,
          archivdatum: new Date(),
          gepostetAm: null,
        },
      })
    ),
  ]);
  await prisma.contentIdea.deleteMany({ where: { id: { in: ids } } });

  // ── E-Mail an alle Benutzer senden ──────────────────────────────────────────
  try {
    const profil = await prisma.kundenprofil.findUnique({
      where: { id: kundenprofilId },
      select: {
        emailAnsprechpartner: true,
        emailDirekt: true,
        emailFreigabeVerantwortlicher: true,
        emailFreigabeVerantwortlicher2: true,
        zugriffe: { select: { user: { select: { email: true } } } },
      },
    });

    if (profil) {
      const emailSet = new Set<string>();
      if (profil.emailAnsprechpartner) emailSet.add(profil.emailAnsprechpartner);
      if (profil.emailDirekt) emailSet.add(profil.emailDirekt);
      if (profil.emailFreigabeVerantwortlicher) emailSet.add(profil.emailFreigabeVerantwortlicher);
      if (profil.emailFreigabeVerantwortlicher2) emailSet.add(profil.emailFreigabeVerantwortlicher2);
      for (const z of profil.zugriffe) emailSet.add(z.user.email);

      const empfaenger = [...emailSet].filter(Boolean);
      if (empfaenger.length > 0) {
        const daten = ideen
          .map(i => i.gewuenschtesPostingDatum)
          .filter((d): d is Date => d instanceof Date)
          .sort((a, b) => a.getTime() - b.getTime());

        const vonDatum = daten[0] ?? new Date();
        const bisDatum = daten[daten.length - 1] ?? new Date();
        const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");

        const html = kalenderEmailHtml({
          anzahl: ideen.length,
          vonDatum,
          bisDatum,
          kalenderLink: `${base}/api/kalender/${kundenprofilId}`,
          loginLink: `${base}/dashboard`,
        });

        await sendEmail({
          to: empfaenger,
          subject: `Ihr Redaktionsplan ist bereit – ${ideen.length} Beiträge eingetragen`,
          text: `Alle ${ideen.length} Beiträge wurden in Ihren Redaktionsplan eingetragen. Kalender-Export: ${base}/api/kalender/${kundenprofilId}`,
          html,
        });
      }
    }
  } catch (e) {
    console.error("[bulk-aktivieren] E-Mail-Versand fehlgeschlagen:", e);
  }

  return Response.json({ anzahl: ideen.length }, { status: 200 });
}

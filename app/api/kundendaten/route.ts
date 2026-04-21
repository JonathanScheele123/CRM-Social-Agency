import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const d = await req.json();

  if (!d.kundenprofilId || !d.beschreibung || !d.tags?.length) {
    return Response.json({ fehler: "Beschreibung und Bereich sind Pflichtfelder." }, { status: 400 });
  }

  const zugriff = await prisma.kundenprofilZugriff.findFirst({
    where: { userId: session.user.id, kundenprofilId: d.kundenprofilId },
    include: { kundenprofil: { select: { unternehmensname: true } } },
  });
  if (!zugriff) {
    return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
  }

  const eintrag = await prisma.kundendaten.create({
    data: {
      kundenprofilId: d.kundenprofilId,
      beschreibung: d.beschreibung,
      inhalt: d.inhalt || null,
      tags: d.tags,
      datum: new Date(),
      veraltet: false,
      hinzugefuegtVon: "Kunde",
    },
  });

  try {
    await sendEmail({
      to: process.env.ADMIN_NOTIFICATION_EMAIL ?? "kontakt@jonathanscheele.de",
      subject: `Neue Kundendaten: ${zugriff.kundenprofil.unternehmensname ?? "Kunde"}`,
      text: `${zugriff.kundenprofil.unternehmensname ?? "Ein Kunde"} hat neue Kundendaten hinzugefügt.\n\nBereich: ${d.tags.join(", ")}\nBeschreibung: ${d.beschreibung}\n\n${d.inhalt ? `Details:\n${d.inhalt}` : ""}`,
      html: `<p><strong>${zugriff.kundenprofil.unternehmensname ?? "Ein Kunde"}</strong> hat neue Kundendaten hinzugefügt.</p><p><strong>Bereich:</strong> ${d.tags.join(", ")}<br><strong>Beschreibung:</strong> ${d.beschreibung}</p>${d.inhalt ? `<p><strong>Details:</strong><br>${d.inhalt.replace(/\n/g, "<br>")}</p>` : ""}`,
    });
  } catch (_) {
    // Email failure does not block the response
  }

  return Response.json({ id: eintrag.id }, { status: 201 });
}

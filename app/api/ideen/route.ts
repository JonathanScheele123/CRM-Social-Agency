import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Kunde reicht eigene Idee ein
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht eingeloggt." }, { status: 401 });
  }

  const d = await req.json();

  // Zugriffscheck: Nutzer muss Zugriff auf dieses Kundenprofil haben
  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: d.kundenprofilId },
    });
    if (!zugriff) {
      return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    }
  }

  const idee = await prisma.contentIdea.create({
    data: {
      kundenprofilId: d.kundenprofilId,
      titel: d.titel ?? null,
      beschreibung: d.beschreibung ?? null,
      plattform: Array.isArray(d.plattform) ? d.plattform : [],
      contentTyp: d.contentTyp ?? null,
      eingereichtVon: "Kunde",
      prioritaet: d.prioritaet ?? null,
      status: "Offen",
      notizen: d.notizen ?? null,
      gewuenschtesPostingDatum: d.gewuenschtesPostingDatum
        ? new Date(d.gewuenschtesPostingDatum)
        : null,
      einreichungsdatum: new Date(),
    },
  });

  return Response.json({ id: idee.id }, { status: 201 });
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Kunde bearbeitet eigene Idee
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht eingeloggt." }, { status: 401 });
  }

  const { id } = await params;
  const d = await req.json();

  const idee = await prisma.contentIdea.findUnique({ where: { id } });
  if (!idee) return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });

  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: idee.kundenprofilId },
    });
    if (!zugriff) return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    // Kunden dürfen nur eigene Ideen bearbeiten
    if (idee.eingereichtVon !== "Kunde") {
      return Response.json({ fehler: "Nur eigene Ideen können bearbeitet werden." }, { status: 403 });
    }
  }

  const aktualisiert = await prisma.contentIdea.update({
    where: { id },
    data: {
      beschreibung: d.beschreibung ?? undefined,
      plattform: Array.isArray(d.plattform) ? d.plattform : undefined,
      contentTyp: d.contentTyp ?? undefined,
      gewuenschtesPostingDatum: d.gewuenschtesPostingDatum
        ? new Date(d.gewuenschtesPostingDatum)
        : d.gewuenschtesPostingDatum === null
        ? null
        : undefined,
    },
  });

  return Response.json({ id: aktualisiert.id });
}

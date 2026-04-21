import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const ERLAUBTE_STATUS = ["Freigegeben", "Abgelehnt", "Ausstehend"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht eingeloggt." }, { status: 401 });
  }

  const { id } = await params;
  const { status, kommentar } = await req.json();

  if (!ERLAUBTE_STATUS.includes(status)) {
    return Response.json({ fehler: "Ungültiger Status." }, { status: 400 });
  }

  // Prüfen ob der User Zugriff auf diesen Kalendereintrag hat
  const eintrag = await prisma.kalenderEintrag.findUnique({
    where: { id },
    select: { kundenprofilId: true },
  });

  if (!eintrag) {
    return Response.json({ fehler: "Eintrag nicht gefunden." }, { status: 404 });
  }

  // Admin darf immer; Kunde nur wenn er Zugriff auf das Interface hat
  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: {
        userId: session.user.id,
        kundenprofilId: eintrag.kundenprofilId,
      },
    });
    if (!zugriff) {
      return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    }
  }

  const aktualisiert = await prisma.kalenderEintrag.update({
    where: { id },
    data: {
      freigabeStatus: status,
      freigabeKommentar: kommentar ?? null,
      freigegebenAm: new Date(),
    },
  });

  return Response.json({ id: aktualisiert.id, status: aktualisiert.freigabeStatus });
}

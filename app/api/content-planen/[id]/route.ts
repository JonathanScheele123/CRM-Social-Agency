import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const d = await req.json();

  const idee = await prisma.contentIdea.findUnique({
    where: { id },
    select: { kundenprofilId: true },
  });

  if (!idee) {
    return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });
  }

  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: idee.kundenprofilId },
    });
    if (!zugriff) {
      return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    }
  }

  try {
    const aktualisiert = await prisma.contentIdea.update({
      where: { id },
      data: {
        captionText:             d.captionText  !== undefined ? d.captionText  || null : undefined,
        notizen:                 d.notizen      !== undefined ? d.notizen      || null : undefined,
        dateizugriff:            d.dateizugriff !== undefined ? d.dateizugriff || null : undefined,
        gewuenschtesPostingDatum: d.geplantAm
          ? new Date(d.geplantAm)
          : d.geplantAm === ""
          ? null
          : undefined,
      },
    });
    return Response.json({ id: aktualisiert.id });
  } catch (e) {
    console.error("[content-planen PATCH]", e);
    return Response.json({ fehler: "Speichern fehlgeschlagen." }, { status: 500 });
  }
}

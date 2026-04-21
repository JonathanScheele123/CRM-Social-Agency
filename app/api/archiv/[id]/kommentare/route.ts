import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const { text } = await req.json();
  if (!text?.trim()) {
    return Response.json({ fehler: "Text fehlt." }, { status: 400 });
  }

  const eintrag = await prisma.archivEintrag.findUnique({
    where: { id },
    select: { kundenprofilId: true },
  });
  if (!eintrag) {
    return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });
  }

  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: eintrag.kundenprofilId },
    });
    if (!zugriff) {
      return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    }
  }

  const kommentar = await prisma.archivKommentar.create({
    data: {
      archivEintragId: id,
      text: text.trim(),
      autorTyp: session.user.rolle === "ADMIN" ? "Agentur" : "Kunde",
      autorName: session.user.name ?? null,
    },
  });

  return Response.json(kommentar, { status: 201 });
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht eingeloggt." }, { status: 401 });
  }

  const { id } = await params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return Response.json({ fehler: "Kommentar darf nicht leer sein." }, { status: 400 });
  }

  const idee = await prisma.contentIdea.findUnique({ where: { id } });
  if (!idee) return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });

  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: idee.kundenprofilId },
    });
    if (!zugriff) return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
  }

  const autorTyp = session.user.rolle === "ADMIN" ? "Agentur" : "Kunde";
  const autorName = session.user.name ?? null;

  const kommentar = await prisma.ideenKommentar.create({
    data: { contentIdeaId: id, text: text.trim(), autorTyp, autorName },
  });

  return Response.json(
    { id: kommentar.id, text: kommentar.text, autorTyp, autorName, createdAt: kommentar.createdAt },
    { status: 201 }
  );
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  const profil = await prisma.kundenprofil.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!profil) {
    return Response.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });
  }

  await prisma.kundenprofil.update({
    where: { id },
    data: { limitGesperrtAb: null },
  });

  return Response.json({ entsperrt: true });
}

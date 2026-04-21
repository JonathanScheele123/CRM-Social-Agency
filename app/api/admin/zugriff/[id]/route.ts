import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const { kundenRolle } = await req.json();

  if (!["Inhaber", "Mitarbeiter", "Co-Admin"].includes(kundenRolle)) {
    return Response.json({ fehler: "Ungültige Rolle." }, { status: 400 });
  }

  await prisma.kundenprofilZugriff.update({
    where: { id },
    data: { kundenRolle },
  });

  return Response.json({ ok: true });
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
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
  const { name, email, neuesPasswort, aktiv, kundenprofilIds } = await req.json();

  if (email !== undefined) {
    const vorhanden = await prisma.user.findFirst({
      where: { email, NOT: { id } },
    });
    if (vorhanden) {
      return Response.json({ fehler: "Diese E-Mail ist bereits vergeben." }, { status: 400 });
    }
  }

  if (neuesPasswort && neuesPasswort.length < 8) {
    return Response.json({ fehler: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name || null;
  if (email !== undefined) updateData.email = email;
  if (aktiv !== undefined) updateData.aktiv = aktiv;
  if (neuesPasswort) updateData.passwort = await bcrypt.hash(neuesPasswort, 12);

  await prisma.user.update({ where: { id }, data: updateData });

  // Replace interface assignments if provided
  if (Array.isArray(kundenprofilIds)) {
    await prisma.kundenprofilZugriff.deleteMany({ where: { userId: id } });
    if (kundenprofilIds.length > 0) {
      await prisma.kundenprofilZugriff.createMany({
        data: kundenprofilIds.map((kundenprofilId: string) => ({ userId: id, kundenprofilId })),
      });
    }
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.user.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Record to delete does not exist")) {
      return Response.json({ fehler: "Benutzer nicht gefunden." }, { status: 404 });
    }
    console.error("[DELETE /api/admin/benutzer]", msg);
    return Response.json({ fehler: "Fehler beim Löschen." }, { status: 500 });
  }
}

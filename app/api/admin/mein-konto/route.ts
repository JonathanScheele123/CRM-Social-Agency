import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { name, email, aktuellesPasswort, neuesPasswort } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return Response.json({ fehler: "Benutzer nicht gefunden." }, { status: 404 });

  // Aktuelles Passwort ist immer Pflicht für Änderungen
  if (!aktuellesPasswort) {
    return Response.json({ fehler: "Aktuelles Passwort ist erforderlich." }, { status: 400 });
  }

  const passwortKorrekt = user.passwort
    ? await bcrypt.compare(aktuellesPasswort, user.passwort)
    : false;

  if (!passwortKorrekt) {
    return Response.json({ fehler: "Aktuelles Passwort ist falsch." }, { status: 400 });
  }

  // E-Mail-Eindeutigkeit prüfen
  if (email && email !== user.email) {
    const vorhanden = await prisma.user.findUnique({ where: { email } });
    if (vorhanden) {
      return Response.json({ fehler: "Diese E-Mail-Adresse ist bereits vergeben." }, { status: 400 });
    }
  }

  // Neues Passwort validieren
  if (neuesPasswort !== undefined && neuesPasswort !== "") {
    if (neuesPasswort.length < 8) {
      return Response.json({ fehler: "Neues Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name || null;
  if (email && email !== user.email) data.email = email;
  if (neuesPasswort) data.passwort = await bcrypt.hash(neuesPasswort, 12);

  await prisma.user.update({ where: { id: user.id }, data });

  return Response.json({ ok: true });
}

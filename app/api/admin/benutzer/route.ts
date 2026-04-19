import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { name, email, passwort, kundenprofilId } = await req.json();

  if (!email || !passwort) {
    return Response.json({ fehler: "E-Mail und Passwort sind Pflichtfelder." }, { status: 400 });
  }

  if (passwort.length < 8) {
    return Response.json({ fehler: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
  }

  const vorhanden = await prisma.user.findUnique({ where: { email } });
  if (vorhanden) {
    return Response.json({ fehler: "Diese E-Mail ist bereits vergeben." }, { status: 400 });
  }

  const passwortHash = await bcrypt.hash(passwort, 12);

  const neuerUser = await prisma.user.create({
    data: {
      name: name || null,
      email,
      passwort: passwortHash,
      rolle: "KUNDE",
    },
  });

  if (kundenprofilId) {
    await prisma.kundenprofilZugriff.create({
      data: {
        userId: neuerUser.id,
        kundenprofilId,
      },
    });
  }

  return Response.json({ id: neuerUser.id }, { status: 201 });
}

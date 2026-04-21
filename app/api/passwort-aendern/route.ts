import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { neuesPasswort } = await req.json();

  if (!neuesPasswort || neuesPasswort.length < 8) {
    return Response.json({ fehler: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
  }

  const hash = await bcrypt.hash(neuesPasswort, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwort: hash,
      mustChangePassword: false,
      passwortGeaendert: true,
    },
  });

  return Response.json({ ok: true });
}

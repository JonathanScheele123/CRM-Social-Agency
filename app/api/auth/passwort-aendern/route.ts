import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { neuesPasswort } = await req.json();

  if (!neuesPasswort || neuesPasswort.length < 8) {
    return Response.json({ fehler: "Das Passwort muss mindestens 8 Zeichen lang sein." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(neuesPasswort, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwort: hashed,
      mustChangePassword: false,
      passwortGeaendert: true,
    },
  });

  return Response.json({ success: true });
}

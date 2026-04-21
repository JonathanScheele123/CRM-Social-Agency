import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }
  const { id } = await params;
  const { name, beschreibung, betreff, html } = await req.json();
  const vorlage = await prisma.emailVorlage.update({
    where: { id },
    data: {
      name: name ?? undefined,
      beschreibung: beschreibung !== undefined ? (beschreibung || null) : undefined,
      betreff: betreff ?? undefined,
      html: html ?? undefined,
    },
  });
  return Response.json({ vorlage });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }
  const { id } = await params;
  await prisma.emailVorlage.delete({ where: { id } });
  return Response.json({ ok: true });
}

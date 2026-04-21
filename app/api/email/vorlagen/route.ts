import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }
  const vorlagen = await prisma.emailVorlage.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({ vorlagen });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }
  const { name, beschreibung, betreff, html } = await req.json();
  if (!name || !betreff || html === undefined) {
    return Response.json({ fehler: "name, betreff und html sind Pflicht." }, { status: 400 });
  }
  const vorlage = await prisma.emailVorlage.create({ data: { name, beschreibung: beschreibung || null, betreff, html } });
  return Response.json({ vorlage }, { status: 201 });
}

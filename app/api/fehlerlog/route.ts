import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const d = await req.json();
    await prisma.fehlerLog.create({
      data: {
        fehlerCode: d.fehlerCode ?? null,
        nachricht: String(d.nachricht ?? "Unbekannter Fehler").slice(0, 1000),
        kontext: d.kontext ? String(d.kontext).slice(0, 200) : null,
        url: d.url ? String(d.url).slice(0, 500) : null,
        benutzerTyp: d.benutzerTyp ?? null,
      },
    });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const logs = await prisma.fehlerLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return Response.json({ logs });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  await prisma.fehlerLog.deleteMany({});
  return Response.json({ ok: true });
}

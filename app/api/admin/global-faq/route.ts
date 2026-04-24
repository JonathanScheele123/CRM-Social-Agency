import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const items = await prisma.globalFaqItem.findMany({
    orderBy: { reihenfolge: "asc" },
  });
  return Response.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { frage, reihenfolge } = await req.json();
  if (!frage?.trim()) return Response.json({ fehler: "Frage fehlt." }, { status: 400 });

  const item = await prisma.globalFaqItem.create({
    data: { frage: frage.trim(), reihenfolge: reihenfolge ?? 0 },
  });
  return Response.json(item, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  // Batch-Update: replace all items
  const { items } = await req.json() as { items: { id?: string; frage: string; reihenfolge: number }[] };

  await prisma.globalFaqItem.deleteMany({});
  await Promise.all(
    items.map((item, i) =>
      prisma.globalFaqItem.create({ data: { frage: item.frage, reihenfolge: i } })
    )
  );

  const updated = await prisma.globalFaqItem.findMany({ orderBy: { reihenfolge: "asc" } });
  return Response.json({ items: updated });
}

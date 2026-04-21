import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { name, slug, introText } = await req.json();

  if (!name || !slug) {
    return Response.json({ fehler: "Name und Slug sind Pflichtfelder." }, { status: 400 });
  }

  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const existing = await prisma.formularConfig.findUnique({ where: { slug: slugClean } });
  if (existing) {
    return Response.json({ fehler: "Dieser Slug ist bereits vergeben." }, { status: 409 });
  }

  const formular = await prisma.formularConfig.create({
    data: { name, slug: slugClean, introText: introText || null },
  });

  return Response.json(formular, { status: 201 });
}

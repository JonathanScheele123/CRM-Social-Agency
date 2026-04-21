import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { slug } = await params;
  const { name, introText } = await req.json();

  const formular = await prisma.formularConfig.update({
    where: { slug },
    data: {
      ...(name !== undefined && { name }),
      ...(introText !== undefined && { introText: introText || null }),
    },
  });

  return Response.json(formular);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { slug } = await params;
  await prisma.formularConfig.delete({ where: { slug } });
  return Response.json({ success: true });
}

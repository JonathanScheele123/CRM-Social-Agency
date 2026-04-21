import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  const logs = await prisma.auditLog.findMany({
    where: { entitaetId: id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json({ logs });
}

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kundenprofilId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { kundenprofilId } = await params;
  const accounts = await prisma.socialAccount.findMany({
    where: { kundenprofilId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      plattform: true,
      accountId: true,
      accountName: true,
      accountHandle: true,
      tokenExpiry: true,
      syncedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(accounts);
}

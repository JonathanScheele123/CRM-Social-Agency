import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KundeDetailView from "@/components/admin/KundeDetailView";

export default async function KundeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const kunde = await prisma.kundenprofil.findUnique({
    where: { id },
    include: {
      zugriffe: { include: { user: true } },
      contentIdeen_: { orderBy: { createdAt: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
      kalender: { orderBy: { geplantAm: "asc" } },
      kpis: { orderBy: { createdAt: "desc" }, include: { dateien: { orderBy: { createdAt: "asc" } } } },
      kundendaten: { orderBy: { createdAt: "desc" } },
      archivEintraege: { orderBy: { gepostetAm: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
    },
  });

  if (!kunde) notFound();

  const alleKunden = await prisma.kundenprofil.findMany({
    orderBy: { kundenNr: "asc" },
    select: { id: true, unternehmensname: true, kundenNr: true },
  });

  return <KundeDetailView kunde={kunde} alleKunden={alleKunden} />;
}

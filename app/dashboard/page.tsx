import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";
import KundenInterface from "@/components/kunde/KundenInterface";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.rolle === "ADMIN") {
    const kunden = await prisma.kundenprofil.findMany({
      orderBy: { kundenNr: "asc" },
      select: {
        id: true,
        kundenNr: true,
        unternehmensname: true,
        kundenKategorie: true,
        statusKunde: true,
        letzterKontakt: true,
        _count: {
          select: {
            contentIdeen_: true,
            kalender: true,
          },
        },
      },
    });

    return <AdminDashboard kunden={kunden} />;
  }

  // Kunde: finde zugewiesenes Interface
  const zugriff = await prisma.kundenprofilZugriff.findFirst({
    where: { userId: session.user.id },
    include: {
      kundenprofil: {
        include: {
          contentIdeen_: { orderBy: { createdAt: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
          kalender: { orderBy: { geplantAm: "asc" } },
          kpis: { orderBy: { createdAt: "desc" } },
          kundendaten: { orderBy: { createdAt: "desc" } },
          archivEintraege: { orderBy: { gepostetAm: "desc" } },
        },
      },
    },
  });

  if (!zugriff) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Kein Interface zugewiesen. Bitte wende dich an den Admin.</p>
      </div>
    );
  }

  return <KundenInterface kundenprofil={zugriff.kundenprofil} />;
}

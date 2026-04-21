import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import AdminDashboard from "@/components/admin/AdminDashboard";
import KundenInterface from "@/components/kunde/KundenInterface";
import CoAdminAuswahl from "@/components/kunde/CoAdminAuswahl";
import KundeDetailView from "@/components/admin/KundeDetailView";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ kunde?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true },
  });
  if (dbUser?.mustChangePassword) {
    redirect("/passwort-aendern");
  }

  if (session.user.rolle === "ADMIN") {
    const [kunden, angenommeneZaehler, fehlerLogs] = await Promise.all([
      prisma.kundenprofil.findMany({
        orderBy: { kundenNr: "asc" },
        select: {
          id: true,
          kundenNr: true,
          unternehmensname: true,
          kundenKategorie: true,
          statusKunde: true,
          letzterKontakt: true,
          vertraglicheFestgelegtePostAnzahl: true,
          _count: {
            select: { contentIdeen_: true, kalender: true, zugriffe: true },
          },
        },
      }),
      prisma.contentIdea.groupBy({
        by: ["kundenprofilId"],
        where: { status: "Angenommen" },
        _count: { _all: true },
      }),
      prisma.fehlerLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    ]);

    const angenommeneMap: Record<string, number> = {};
    for (const r of angenommeneZaehler) {
      angenommeneMap[r.kundenprofilId] = r._count._all;
    }

    return (
      <AdminDashboard
        kunden={kunden.map(k => ({ ...k, angenommeneIdeen: angenommeneMap[k.id] ?? 0 }))}
        fehlerLogs={fehlerLogs}
      />
    );
  }

  const { kunde: ausgewaehltKundeId } = await searchParams;

  // Alle Zugriffe des Benutzers laden
  const alleZugriffe = await prisma.kundenprofilZugriff.findMany({
    where: { userId: session.user.id },
    include: {
      kundenprofil: {
        select: { id: true, unternehmensname: true, kundenNr: true, kundenKategorie: true, statusKunde: true },
      },
    },
  });

  if (alleZugriffe.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Kein Interface zugewiesen. Bitte wenden Sie sich an den Admin.</p>
      </div>
    );
  }

  const istCoAdmin = alleZugriffe.some(z => z.kundenRolle === "Co-Admin");

  // Co-Admin ohne ausgewähltes Interface → Auswahlübersicht
  if (istCoAdmin && !ausgewaehltKundeId) {
    const interfaces = alleZugriffe
      .filter(z => z.kundenRolle === "Co-Admin")
      .map(z => z.kundenprofil);
    return <CoAdminAuswahl interfaces={interfaces} />;
  }

  // Welches Interface laden?
  const zielZugriff = ausgewaehltKundeId
    ? alleZugriffe.find(z => z.kundenprofil.id === ausgewaehltKundeId)
    : alleZugriffe[0];

  if (!zielZugriff) {
    redirect("/dashboard");
  }

  const kundenprofilId = zielZugriff.kundenprofil.id;

  // Co-Admin bekommt das vollständige Admin-Interface (KundeDetailView)
  if (zielZugriff.kundenRolle === "Co-Admin") {
    const [kundenprofil, alleKunden] = await Promise.all([
      prisma.kundenprofil.findUnique({
        where: { id: kundenprofilId },
        include: {
          zugriffe: { include: { user: true } },
          contentIdeen_: { orderBy: { createdAt: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
          kalender: { orderBy: { geplantAm: "asc" } },
          kpis: { orderBy: { createdAt: "desc" }, include: { dateien: { orderBy: { createdAt: "asc" } } } },
          kundendaten: { orderBy: { createdAt: "desc" } },
          archivEintraege: { orderBy: { gepostetAm: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
        },
      }),
      prisma.kundenprofil.findMany({
        where: { zugriffe: { some: { userId: session.user.id, kundenRolle: "Co-Admin" } } },
        orderBy: { kundenNr: "asc" },
        select: { id: true, unternehmensname: true, kundenNr: true },
      }),
    ]);

    if (!kundenprofil) redirect("/dashboard");
    return <KundeDetailView kunde={kundenprofil} alleKunden={alleKunden} />;
  }

  // Inhaber / Mitarbeiter: normale Kundenansicht
  const [kundenprofil, globalFaq] = await Promise.all([
    prisma.kundenprofil.findUnique({
      where: { id: kundenprofilId },
      include: {
        contentIdeen_: { orderBy: { createdAt: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
        kalender: { orderBy: { geplantAm: "asc" } },
        kpis: { orderBy: { createdAt: "desc" }, include: { dateien: { orderBy: { createdAt: "asc" } } } },
        kundendaten: { orderBy: { createdAt: "desc" } },
        archivEintraege: { orderBy: { gepostetAm: "desc" }, include: { kommentare: { orderBy: { createdAt: "asc" } } } },
      },
    }),
    prisma.globalFaqItem.findMany({ orderBy: { reihenfolge: "asc" } }),
  ]);

  if (!kundenprofil) redirect("/dashboard");

  return (
    <KundenInterface
      kundenprofil={{
        ...kundenprofil,
        globalFaqItems: globalFaq.map(f => f.frage),
      }}
      kundenRolle={zielZugriff.kundenRolle}
      coAdminInterfaces={undefined}
    />
  );
}

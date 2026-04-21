import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const ERLAUBTE_STATUS = ["Offen", "Angenommen", "Verworfen"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!ERLAUBTE_STATUS.includes(status)) {
    return Response.json({ fehler: "Ungültiger Status." }, { status: 400 });
  }

  const idee = await prisma.contentIdea.findUnique({
    where: { id },
    select: { kundenprofilId: true },
  });

  if (!idee) {
    return Response.json({ fehler: "Nicht gefunden." }, { status: 404 });
  }

  if (session.user.rolle !== "ADMIN") {
    const zugriff = await prisma.kundenprofilZugriff.findFirst({
      where: { userId: session.user.id, kundenprofilId: idee.kundenprofilId },
    });
    if (!zugriff) {
      return Response.json({ fehler: "Kein Zugriff." }, { status: 403 });
    }
  }

  // Bei "Angenommen": Limit prüfen BEVOR gespeichert wird
  if (status === "Angenommen") {
    const profil = await prisma.kundenprofil.findUnique({
      where: { id: idee.kundenprofilId },
      select: {
        limitReel: true, limitStory: true, limitBild: true, limitKarussell: true,
        vertraglicheFestgelegtePostAnzahl: true,
        limitGesperrtAb: true,
      },
    });

    if (profil) {
      // Harter Lock: Countdown abgelaufen
      if (profil.limitGesperrtAb && new Date(profil.limitGesperrtAb) <= new Date()) {
        return Response.json({ fehler: "Freigabe-Limit gesperrt." }, { status: 403 });
      }

      const vollIdee = await prisma.contentIdea.findUnique({ where: { id }, select: { contentTyp: true } });
      const typMap: Record<string, number | null> = {
        Reel: profil.limitReel, Story: profil.limitStory,
        Bild: profil.limitBild, Karussell: profil.limitKarussell,
      };
      const hatTypLimits = Object.values(typMap).some(v => v !== null);

      if (hatTypLimits) {
        // Gesamtlimit als harter Cap (auch im Typ-Limit-Modus)
        if (profil.vertraglicheFestgelegtePostAnzahl !== null) {
          const totalCount = await prisma.contentIdea.count({
            where: { kundenprofilId: idee.kundenprofilId, status: "Angenommen" },
          });
          if (totalCount >= profil.vertraglicheFestgelegtePostAnzahl) {
            return Response.json({ fehler: "Monatliches Post-Limit erreicht." }, { status: 403 });
          }
        }

        const contentTyp = vollIdee?.contentTyp ?? null;
        const limit = contentTyp ? (typMap[contentTyp] ?? null) : null;

        // Typ mit Limit: Anzahl bereits Angenommener prüfen
        if (contentTyp && limit !== null) {
          const count = await prisma.contentIdea.count({
            where: { kundenprofilId: idee.kundenprofilId, status: "Angenommen", contentTyp },
          });
          if (count >= limit) {
            return Response.json({ fehler: `Limit für ${contentTyp} erreicht.` }, { status: 403 });
          }
        }

        // Typ ohne eigenes Limit (oder null-Limit) ist in Typ-Limit-Modus nicht erlaubt
        if (contentTyp && (!(contentTyp in typMap) || limit === null)) {
          return Response.json({ fehler: `Kein Limit definiert für ${contentTyp}.` }, { status: 403 });
        }
      } else if (profil.vertraglicheFestgelegtePostAnzahl !== null) {
        const count = await prisma.contentIdea.count({
          where: { kundenprofilId: idee.kundenprofilId, status: "Angenommen" },
        });
        if (count >= profil.vertraglicheFestgelegtePostAnzahl) {
          return Response.json({ fehler: "Monatliches Post-Limit erreicht." }, { status: 403 });
        }
      }
    }
  }

  const aktualisiert = await prisma.contentIdea.update({
    where: { id },
    data: { status },
  });

  // Prüfe ob Limit erreicht wurde und setze/lösche limitGesperrtAb
  // Fehler hier dürfen die Hauptantwort nicht verhindern
  try {
    const kundenprofilId = idee.kundenprofilId;
    const profil = await prisma.kundenprofil.findUnique({
      where: { id: kundenprofilId },
      select: {
        vertraglicheFestgelegtePostAnzahl: true,
        limitReel: true,
        limitStory: true,
        limitBild: true,
        limitKarussell: true,
        limitGesperrtAb: true,
      },
    });

    if (profil) {
      const alleIdeen = await prisma.contentIdea.findMany({
        where: { kundenprofilId, status: "Angenommen" },
        select: { contentTyp: true },
      });

      const angenommenGesamt = alleIdeen.length;
      const angenommenProTyp: Record<string, number> = {};
      for (const i of alleIdeen) {
        const t = i.contentTyp ?? "Sonstiges";
        angenommenProTyp[t] = (angenommenProTyp[t] ?? 0) + 1;
      }

      const hatTypLimits = [profil.limitReel, profil.limitStory, profil.limitBild, profil.limitKarussell].some(l => l !== null);
      let limitErreicht = false;

      if (hatTypLimits) {
        const typMap: Record<string, number | null> = {
          Reel: profil.limitReel,
          Story: profil.limitStory,
          Bild: profil.limitBild,
          Karussell: profil.limitKarussell,
        };
        const typenMitLimit = Object.entries(typMap).filter(([, l]) => l !== null) as [string, number][];
        limitErreicht = typenMitLimit.length > 0 &&
          typenMitLimit.every(([typ, limit]) => (angenommenProTyp[typ] ?? 0) >= limit);
        // Gesamtlimit als harter Cap: Countdown auch auslösen wenn total erreicht
        if (!limitErreicht && profil.vertraglicheFestgelegtePostAnzahl !== null) {
          limitErreicht = angenommenGesamt >= profil.vertraglicheFestgelegtePostAnzahl;
        }
      } else if (profil.vertraglicheFestgelegtePostAnzahl !== null) {
        limitErreicht = angenommenGesamt >= profil.vertraglicheFestgelegtePostAnzahl;
      }

      if (limitErreicht && !profil.limitGesperrtAb) {
        await prisma.kundenprofil.update({
          where: { id: kundenprofilId },
          data: { limitGesperrtAb: new Date(Date.now() + 10 * 60 * 1000) },
        });
      } else if (!limitErreicht && profil.limitGesperrtAb) {
        await prisma.kundenprofil.update({
          where: { id: kundenprofilId },
          data: { limitGesperrtAb: null },
        });
      }
    }
  } catch (e) {
    console.error("[status] Limit-Prüfung fehlgeschlagen:", e);
  }

  // Aktuellen limitGesperrtAb-Wert für die Antwort lesen
  const aktuellesProfil = await prisma.kundenprofil.findUnique({
    where: { id: idee.kundenprofilId },
    select: { limitGesperrtAb: true },
  }).catch(() => null);

  return Response.json({
    id: aktualisiert.id,
    status: aktualisiert.status,
    limitGesperrtAb: aktuellesProfil?.limitGesperrtAb ?? null,
  });
}

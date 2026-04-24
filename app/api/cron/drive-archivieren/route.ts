import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriveFileMeta, findOrCreateDriveFolder, updateDriveFile } from "@/lib/drive";

function fileIdAusDriveLink(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function rootFolderIdAusCloudLink(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function datumFormatieren(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function dateinameBerechnen(titel: string | null, geplantAm: Date | null): string {
  const t = (titel ?? "Unbekannt").replace(/[/\\:*?"<>|]/g, "-").trim();
  const d = geplantAm ? datumFormatieren(geplantAm) : "";
  return d ? `${t} ${d}` : t;
}

const ALT_ORDNER: Record<string, string> = {
  Reel: "Alt Reels",
  Story: "Alt Stories",
  Karussell: "Alt Karussell",
  Bild: "Alt Bild",
};

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const zweiTageHer = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  const eintraege = await prisma.kalenderEintrag.findMany({
    where: {
      gepostet: true,
      archiviert: false,
      dateizugriff: { not: null },
      gepostetAm: { lte: zweiTageHer },
    },
    include: {
      kundenprofil: { select: { cloudLink: true } },
    },
  });

  const ergebnisse: { id: string; ok: boolean; fehler?: string }[] = [];

  for (const eintrag of eintraege) {
    try {
      const fileId = fileIdAusDriveLink(eintrag.dateizugriff);
      if (!fileId) throw new Error("Keine gültige Drive-Datei-URL");

      const rootFolderId = rootFolderIdAusCloudLink(eintrag.kundenprofil.cloudLink);
      if (!rootFolderId) throw new Error("Kein Cloud-Link beim Kundenprofil");

      const meta = await getDriveFileMeta(fileId) as { thumbnailLink?: string; mimeType?: string; parents?: string[] };
      const removeParents = (meta as { parents?: string[] }).parents?.join(",") ?? "";

      const altOrdnerName = (eintrag.contentTyp && ALT_ORDNER[eintrag.contentTyp]) || "Alt Reels";
      const fertigeProjekteId = await findOrCreateDriveFolder(rootFolderId, "Fertige Projekte");
      const zielOrdnerId = await findOrCreateDriveFolder(fertigeProjekteId, altOrdnerName);
      const neuerName = dateinameBerechnen(eintrag.titel, eintrag.geplantAm);

      await updateDriveFile(fileId, {
        name: neuerName,
        addParents: zielOrdnerId,
        removeParents: removeParents || undefined,
      });

      await prisma.kalenderEintrag.update({
        where: { id: eintrag.id },
        data: { archiviert: true },
      });

      ergebnisse.push({ id: eintrag.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      ergebnisse.push({ id: eintrag.id, ok: false, fehler: msg });
    }
  }

  return Response.json({ verarbeitet: eintraege.length, ergebnisse });
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriveClient } from "@/lib/drive";

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

async function ordnerFindenOderErstellen(
  drive: ReturnType<typeof getDriveClient>,
  name: string,
  parentId: string
): Promise<string> {
  const search = await drive.files.list({
    q: `name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }
  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
    supportsAllDrives: true,
  });
  return created.data.id!;
}

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

  const drive = getDriveClient();
  const ergebnisse: { id: string; ok: boolean; fehler?: string }[] = [];

  for (const eintrag of eintraege) {
    try {
      const fileId = fileIdAusDriveLink(eintrag.dateizugriff);
      if (!fileId) throw new Error("Keine gültige Drive-Datei-URL");

      const rootFolderId = rootFolderIdAusCloudLink(eintrag.kundenprofil.cloudLink);
      if (!rootFolderId) throw new Error("Kein Cloud-Link beim Kundenprofil");

      // Get current parents of the file
      const meta = await drive.files.get({
        fileId,
        fields: "parents",
        supportsAllDrives: true,
      });
      const removeParents = (meta.data.parents ?? []).join(",");

      // Map contentTyp → Alt-Unterordner-Name
      const ALT_ORDNER: Record<string, string> = {
        Reel:      "Alt Reels",
        Story:     "Alt Stories",
        Karussell: "Alt Karussell",
        Bild:      "Alt Bild",
      };
      const altOrdnerName = (eintrag.contentTyp && ALT_ORDNER[eintrag.contentTyp]) || "Alt Reels";

      // Navigate: root → Fertige Projekte → Alt X
      const fertigeProjekteId = await ordnerFindenOderErstellen(drive, "Fertige Projekte", rootFolderId);
      const zielOrdnerId = await ordnerFindenOderErstellen(drive, altOrdnerName, fertigeProjekteId);

      const neuerName = dateinameBerechnen(eintrag.titel, eintrag.geplantAm);

      await drive.files.update({
        fileId,
        addParents: zielOrdnerId,
        removeParents: removeParents || undefined,
        supportsAllDrives: true,
        requestBody: { name: neuerName },
        fields: "id,name,parents",
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

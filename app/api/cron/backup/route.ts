import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { findOrCreateDriveFolder, uploadDriveFile } from "@/lib/drive";

const BACKUP_FOLDER_NAME = "CRM Backup";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
    }
  }

  try {
    const jetzt = new Date();
    const dateiname = `CRM-Backup-${jetzt.toISOString().slice(0, 10)}.json`;

    const kunden = await prisma.kundenprofil.findMany({
      where: {
        OR: [
          { dsgvoLoeschdatum: null },
          { dsgvoLoeschdatum: { gt: jetzt } },
        ],
        NOT: { statusKunde: "anonymisiert" },
      },
      include: {
        contentIdeen_: { orderBy: { createdAt: "desc" } },
        kalender: { orderBy: { geplantAm: "asc" } },
        kpis: { orderBy: { createdAt: "desc" }, include: { dateien: true } },
        kundendaten: { orderBy: { createdAt: "desc" } },
        archivEintraege: { orderBy: { gepostetAm: "desc" } },
      },
    });

    const kundenIds = kunden.map((k) => k.id);
    const auditLogs = await prisma.auditLog.findMany({
      where: { entitaetId: { in: kundenIds } },
      orderBy: { createdAt: "desc" },
    });

    const backup = {
      exportiert_am: jetzt.toISOString(),
      version: "1.0",
      hinweis: "DSGVO-konformes Backup – Datensätze mit abgelaufenem Löschdatum oder anonymisiertem Status wurden ausgeschlossen.",
      kunden_anzahl: kunden.length,
      kunden,
      audit_logs: auditLogs,
    };

    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID nicht gesetzt.");

    const folderId = await findOrCreateDriveFolder(rootFolderId, BACKUP_FOLDER_NAME);
    const json = JSON.stringify(backup, null, 2);
    await uploadDriveFile(folderId, dateiname, "application/json", Buffer.from(json, "utf-8"));

    return Response.json({ ok: true, datei: dateiname, kunden: kunden.length });
  } catch (err) {
    console.error("Backup-Fehler:", err);
    return Response.json({ fehler: String(err) }, { status: 500 });
  }
}

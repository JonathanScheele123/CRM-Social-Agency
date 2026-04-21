import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriveClient } from "@/lib/drive";
import { Readable } from "stream";

const BACKUP_FOLDER_NAME = "CRM Backup";
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

async function findOrCreateBackupFolder(drive: ReturnType<typeof getDriveClient>): Promise<string> {
  const search = await drive.files.list({
    q: `name='${BACKUP_FOLDER_NAME}' and '${ROOT_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name: BACKUP_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  });
  return created.data.id!;
}

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

    const kundenIds = kunden.map(k => k.id);
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

    const json = JSON.stringify(backup, null, 2);
    const drive = getDriveClient();
    const folderId = await findOrCreateBackupFolder(drive);

    const stream = Readable.from([Buffer.from(json, "utf-8")]);

    await drive.files.create({
      requestBody: {
        name: dateiname,
        mimeType: "application/json",
        parents: [folderId],
      },
      media: {
        mimeType: "application/json",
        body: stream,
      },
    });

    return Response.json({ ok: true, datei: dateiname, kunden: kunden.length });
  } catch (err) {
    console.error("Backup-Fehler:", err);
    return Response.json({ fehler: String(err) }, { status: 500 });
  }
}

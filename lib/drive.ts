import { google } from "googleapis";

function buildAuth() {
  const clientEmail = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Google Drive-Zugangsdaten fehlen (GOOGLE_SA_CLIENT_EMAIL, GOOGLE_SA_PRIVATE_KEY).");
  }
  return new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export function getDriveAuth() {
  return buildAuth();
}

export function getDriveClient() {
  return google.drive({ version: "v3", auth: buildAuth() });
}

async function createFolder(drive: ReturnType<typeof google.drive>, name: string, parentId: string): Promise<string> {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });
  return res.data.id!;
}

/**
 * Erstellt die vollständige Ordnerstruktur für einen neuen Kunden.
 * Gibt die URL des Hauptordners zurück.
 */
export async function erstelleKundenOrdner(unternehmensname: string): Promise<string> {
  const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootFolderId) throw new Error("GOOGLE_DRIVE_ROOT_FOLDER_ID ist nicht gesetzt.");

  const drive = getDriveClient();

  // Hauptordner mit Unternehmensname
  const hauptId = await createFolder(drive, unternehmensname, rootFolderId);

  // Arbeitsmaterial/ und Rohdateien/ direkt im Hauptordner
  await createFolder(drive, "Arbeitsmaterial", hauptId);
  await createFolder(drive, "Rohdateien", hauptId);

  // Fertige Projekte/ mit Alt-Unterordnern
  const fertigId = await createFolder(drive, "Fertige Projekte", hauptId);
  await createFolder(drive, "Alt Reels", fertigId);
  await createFolder(drive, "Alt Stories", fertigId);
  await createFolder(drive, "Alt Karussell", fertigId);
  await createFolder(drive, "Alt Bild", fertigId);

  return `https://drive.google.com/drive/folders/${hauptId}`;
}

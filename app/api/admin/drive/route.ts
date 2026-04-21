import { auth } from "@/auth";
import { getDriveClient } from "@/lib/drive";
import { NextRequest } from "next/server";
import { Readable } from "stream";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const folderId = req.nextUrl.searchParams.get("folderId");
  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    return Response.json({ fehler: "Ungültige folderId." }, { status: 400 });
  }

  const drive = getDriveClient();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)",
    orderBy: "folder,name",
    pageSize: 200,
  });

  return Response.json({ files: res.data.files ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const folderId = req.nextUrl.searchParams.get("folderId");
  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    return Response.json({ fehler: "Ungültige folderId." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ fehler: "Keine Datei angegeben." }, { status: 400 });

  const drive = getDriveClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [folderId],
    },
    media: {
      mimeType: file.type || "application/octet-stream",
      body: stream,
    },
    fields: "id,name,mimeType,size,modifiedTime,webViewLink",
  });

  return Response.json({ file: res.data }, { status: 201 });
}

// Neuen Ordner erstellen
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const parentId = req.nextUrl.searchParams.get("folderId");
  if (!parentId || !/^[a-zA-Z0-9_-]+$/.test(parentId)) {
    return Response.json({ fehler: "Ungültige folderId." }, { status: 400 });
  }

  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ fehler: "Name fehlt." }, { status: 400 });

  const drive = getDriveClient();
  const res = await drive.files.create({
    requestBody: {
      name: name.trim(),
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id,name,mimeType,modifiedTime",
  });

  return Response.json({ file: res.data }, { status: 201 });
}

// Datei in anderen Ordner verschieben
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return Response.json({ fehler: "fileId fehlt." }, { status: 400 });

  const { targetFolderId, sourceFolderId } = await req.json();
  if (!targetFolderId) return Response.json({ fehler: "targetFolderId fehlt." }, { status: 400 });
  if (!sourceFolderId) return Response.json({ fehler: "sourceFolderId fehlt." }, { status: 400 });

  const drive = getDriveClient();
  try {
    await drive.files.update({
      fileId,
      addParents: targetFolderId,
      removeParents: sourceFolderId,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      requestBody: {},
      fields: "id,parents",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: `Drive-Fehler: ${msg}` }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return Response.json({ fehler: "fileId fehlt." }, { status: 400 });

  const drive = getDriveClient();
  await drive.files.delete({ fileId });

  return Response.json({ ok: true });
}

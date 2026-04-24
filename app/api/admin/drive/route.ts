import { auth } from "@/auth";
import {
  getDriveFiles,
  uploadDriveFile,
  createDriveFolder,
  deleteDriveFile,
  moveDriveFile,
} from "@/lib/drive";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const folderId = req.nextUrl.searchParams.get("folderId");
  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    return Response.json({ fehler: "Ungültige folderId." }, { status: 400 });
  }

  try {
    const files = await getDriveFiles(folderId);
    return Response.json({ files });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Drive GET]", msg);
    return Response.json({ fehler: msg, files: [] }, { status: 500 });
  }
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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadDriveFile(folderId, file.name, file.type || "application/octet-stream", buffer);
    return Response.json({ file: result }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: msg }, { status: 500 });
  }
}

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

  try {
    const folder = await createDriveFolder(parentId, name.trim());
    return Response.json({ file: folder }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: msg }, { status: 500 });
  }
}

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

  try {
    await moveDriveFile(fileId, targetFolderId, sourceFolderId);
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

  try {
    await deleteDriveFile(fileId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: msg }, { status: 500 });
  }

  return Response.json({ ok: true });
}

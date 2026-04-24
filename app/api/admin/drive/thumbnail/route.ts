import { auth } from "@/auth";
import { getDriveFileMeta, downloadDriveFile } from "@/lib/drive";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.rolle !== "ADMIN" && session.user.rolle !== "KUNDE")) {
    return new Response("Nicht autorisiert.", { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return new Response("fileId fehlt.", { status: 400 });

  try {
    const meta = await getDriveFileMeta(fileId);

    if (meta.thumbnailLink) {
      const thumbRes = await fetch(meta.thumbnailLink.replace(/=s\d+/, "=s400"));
      if (thumbRes.ok) {
        const buffer = await thumbRes.arrayBuffer();
        return new Response(buffer, {
          headers: {
            "Content-Type": thumbRes.headers.get("Content-Type") ?? "image/jpeg",
            "Cache-Control": "private, max-age=3600",
          },
        });
      }
    }

    if (!meta.mimeType?.startsWith("image/")) {
      return new Response("Keine Vorschau verfügbar.", { status: 404 });
    }

    const { buffer, mimeType } = await downloadDriveFile(fileId);
    return new Response(buffer, {
      headers: { "Content-Type": mimeType, "Cache-Control": "private, max-age=300" },
    });
  } catch {
    return new Response("Vorschau nicht verfügbar.", { status: 404 });
  }
}

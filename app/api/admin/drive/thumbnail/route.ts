import { auth } from "@/auth";
import { getDriveClient, getDriveAuth } from "@/lib/drive";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.rolle !== "ADMIN" && session.user.rolle !== "KUNDE")) {
    return new Response("Nicht autorisiert.", { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return new Response("fileId fehlt.", { status: 400 });

  try {
    const drive = getDriveClient();

    // Get thumbnailLink from metadata
    const meta = await drive.files.get({ fileId, fields: "thumbnailLink,mimeType,name" });
    const thumbnailLink = meta.data.thumbnailLink;

    if (thumbnailLink) {
      // Get access token to authenticate the thumbnailLink request
      const driveAuth = getDriveAuth();
      const tokenResponse = await driveAuth.getAccessToken();
      const token = typeof tokenResponse === "string" ? tokenResponse : (tokenResponse as { token?: string } | null)?.token;

      const thumbRes = await fetch(thumbnailLink.replace(/=s\d+/, "=s400"), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

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

    // Fallback: stream first 2MB of file as preview (for images without thumbnailLink)
    const mimeType = meta.data.mimeType ?? "application/octet-stream";
    if (!mimeType.startsWith("image/")) {
      return new Response("Keine Vorschau verfügbar.", { status: 404 });
    }

    const { Readable } = await import("stream");
    const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
    const chunks: Buffer[] = [];
    let total = 0;
    await new Promise<void>((resolve, reject) => {
      (res.data as NodeJS.ReadableStream)
        .on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          total += chunk.length;
          if (total > 2 * 1024 * 1024) resolve();
        })
        .on("end", resolve)
        .on("error", reject);
    });

    return new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": mimeType, "Cache-Control": "private, max-age=300" },
    });
  } catch {
    return new Response("Vorschau nicht verfügbar.", { status: 404 });
  }
}

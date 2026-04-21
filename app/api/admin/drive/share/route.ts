import { auth } from "@/auth";
import { getDriveClient } from "@/lib/drive";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return Response.json({ fehler: "fileId fehlt." }, { status: 400 });

  const drive = getDriveClient();
  try {
    await drive.permissions.create({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: `Drive-Fehler: ${msg}` }, { status: 500 });
  }

  const link = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  return Response.json({ link });
}

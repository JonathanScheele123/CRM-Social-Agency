import { auth } from "@/auth";
import { shareDriveFile } from "@/lib/drive";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId) return Response.json({ fehler: "fileId fehlt." }, { status: 400 });

  try {
    const link = await shareDriveFile(fileId);
    return Response.json({ link });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ fehler: `Drive-Fehler: ${msg}` }, { status: 500 });
  }
}

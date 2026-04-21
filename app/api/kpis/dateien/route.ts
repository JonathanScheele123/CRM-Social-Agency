import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ fehler: "Nicht autorisiert" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const kpiId = formData.get("kpiId") as string | null;

  if (!file || !kpiId) {
    return NextResponse.json({ fehler: "Datei und KPI-ID erforderlich" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const typ = ["mp4", "mov", "webm", "avi"].includes(ext)
    ? "video"
    : ["pdf"].includes(ext)
    ? "pdf"
    : ["ppt", "pptx", "key"].includes(ext)
    ? "presentation"
    : "other";

  const dir = join(process.cwd(), "public", "uploads", "kpi", kpiId);
  await mkdir(dir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(dir, safeName), Buffer.from(bytes));

  const url = `/uploads/kpi/${kpiId}/${safeName}`;

  const datei = await prisma.kPIDatei.create({
    data: {
      kpiId,
      name: file.name,
      url,
      typ,
      groesse: file.size,
    },
  });

  return NextResponse.json(datei);
}

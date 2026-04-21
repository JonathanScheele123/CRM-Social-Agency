import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const SKALA_LABELS: Record<string, string> = {
  q1:  "Wie zufrieden sind Sie insgesamt mit unserer Zusammenarbeit?",
  q2:  "Wie froh sind Sie, dass wir Sie aktuell als Agentur begleiten?",
  q3:  "Wie zufrieden sind Sie insgesamt mit unserer Dienstleistung?",
  q4:  "Wie zufrieden sind Sie mit der Kommunikation und Abstimmung mit uns?",
  q5:  "Wie zufrieden sind Sie mit unserer Zuverlässigkeit und der Umsetzung?",
  q6:  "Wie zufrieden waren Sie mit dem Ablauf des Drehtags bzw. der Drehtage?",
  q7:  "Wie professionell und angenehm war die Betreuung vor Ort für Sie?",
  q8:  "Hatten Sie das Gefühl, dass Ihre Ziele eingehalten bzw. erreicht wurden?",
  q9:  "Wie zufrieden sind Sie mit unserem Contentfreigabe-Tool?",
  q10: "Wie einfach ist für Sie die Nutzung unserer Bedienoberfläche?",
  q11: "Wie zufrieden sind Sie mit der Freigabe und Abstimmung von Inhalten?",
};

const TEXT_LABELS: Record<string, string> = {
  q12: "Was gefällt Ihnen an unserer Zusammenarbeit aktuell am meisten?",
  q13: "Was können wir verbessern?",
  q14: "Gibt es sonst noch etwas, das Sie uns mitgeben möchten?",
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ kundenprofilId: string }> }
) {
  const { kundenprofilId } = await params;
  const { skala, texte } = await req.json();

  const exists = await prisma.kundenprofil.findUnique({
    where: { id: kundenprofilId },
    select: { id: true },
  });
  if (!exists) {
    return Response.json({ fehler: "Kundenprofil nicht gefunden." }, { status: 404 });
  }

  const zeilen: string[] = [];

  for (const [id, label] of Object.entries(SKALA_LABELS)) {
    const wert = skala?.[id];
    zeilen.push(`${label}\n→ ${wert !== null && wert !== undefined ? `${wert}/10` : "Keine Angabe"}`);
  }

  for (const [id, label] of Object.entries(TEXT_LABELS)) {
    const antwort = texte?.[id];
    zeilen.push(`${label}\n→ ${antwort?.trim() || "Keine Angabe"}`);
  }

  const inhalt = zeilen.join("\n\n");

  const datum = new Date();
  const datumStr = datum.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

  await prisma.kundendaten.create({
    data: {
      kundenprofilId,
      beschreibung: `Kundenfeedback vom ${datumStr}`,
      inhalt,
      tags: ["Feedback"],
      hinzugefuegtVon: "Kunde",
      datum,
    },
  });

  return Response.json({ success: true }, { status: 200 });
}

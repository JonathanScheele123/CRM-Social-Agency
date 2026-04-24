import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcs(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kundenprofilId: string }> }
) {
  const { kundenprofilId } = await params;

  const eintraege = await prisma.kalenderEintrag.findMany({
    where: { kundenprofilId, archiviert: false, geplantAm: { not: null } },
    orderBy: { geplantAm: "asc" },
  });

  const now = icsDate(new Date());

  const crmBase = (process.env.NEXTAUTH_URL ?? "https://crm.jonathanscheele.de").replace(/\/$/, "");

  const events = eintraege
    .filter(e => e.geplantAm)
    .map(e => {
      const start = e.geplantAm!;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const titel = e.titel ?? e.contentTyp ?? "Content-Beitrag";

      const zeilen: string[] = [];
      if (e.dateizugriff) zeilen.push(`Drive: ${e.dateizugriff}`);
      if (e.captionText)  zeilen.push(``, `Caption:`, e.captionText);
      zeilen.push(``, `---`, `CRM: ${crmBase}/dashboard`);

      const beschreibung = zeilen.map(escapeIcs).join("\\n");

      return [
        "BEGIN:VEVENT",
        `UID:${e.id}@js-media.de`,
        `DTSTAMP:${now}`,
        `DTSTART:${icsDate(start)}`,
        `DTEND:${icsDate(end)}`,
        `SUMMARY:${escapeIcs(titel)}`,
        `DESCRIPTION:${beschreibung}`,
        e.dateizugriff ? `URL:${e.dateizugriff}` : null,
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//JS Media//Redaktionsplan//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:JS Media Redaktionsplan",
    "X-WR-TIMEZONE:Europe/Berlin",
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="redaktionsplan.ics"`,
      "Cache-Control": "no-store",
    },
  });
}

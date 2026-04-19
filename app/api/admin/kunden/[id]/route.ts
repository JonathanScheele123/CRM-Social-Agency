import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

function bereinigeDaten(daten: Record<string, unknown>) {
  const stringFelder = [
    "unternehmensname", "ansprechpartner", "geschaeftsadresse", "emailAnsprechpartner",
    "branche", "telefonnummer", "webseite", "emailDirekt", "socialMediaKanaele",
    "freigabeVerantwortlicher", "emailFreigabeVerantwortlicher", "cloudLink", "zusatzlinks",
    "statusKunde", "kundenKategorie", "kundenzufriedenheit", "archiv", "kundenfeedback",
    "notizenIntern", "contentIdeen", "postingKalender", "mitarbeiterImBildRechtlichGeklaert",
    "mitarbeiterImBildRechtlichGeregelt", "mitarbeiterNichtZeigen", "welcheMitarbeiterNichtZeigen",
    "sensibleBereiche", "welcheBereicheNichtZeigen", "drehtageUhrzeiten", "ansprechpartnerDrehtag",
    "einschraenkungenVorOrt", "selbstAuftreten", "kurzbeschreibung", "kernwerte",
    "alleinstellungsmerkmale", "haeufigsteProbleme", "haeufigsteEinwaende", "zielgruppeOnline",
    "wasKundenLieben", "zielgruppe", "hauptziel", "heroProdukte", "wiederkehrendeProdukte",
    "eventsNaechsteMonate", "besonderheitenPlanung", "herausforderungen", "vorbereiteteFragenBesprechen",
  ];

  const arrayFelder = ["contentPlan", "drehtageAnWelchenTagen"];
  const zahlFelder = ["vertraglicheFestgelegtePostAnzahl"];
  const datumFelder = ["vertragsstart", "letzterKontakt", "wunschdatum"];

  const ergebnis: Record<string, unknown> = {};

  for (const feld of stringFelder) {
    if (feld in daten) ergebnis[feld] = daten[feld] === "" ? null : daten[feld];
  }
  for (const feld of arrayFelder) {
    if (feld in daten) ergebnis[feld] = Array.isArray(daten[feld]) ? daten[feld] : [];
  }
  for (const feld of zahlFelder) {
    if (feld in daten) {
      ergebnis[feld] = daten[feld] === "" || daten[feld] == null ? null : Number(daten[feld]);
    }
  }
  for (const feld of datumFelder) {
    if (feld in daten) {
      ergebnis[feld] = daten[feld] === "" || daten[feld] == null ? null : new Date(daten[feld] as string);
    }
  }

  return ergebnis;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;
  const daten = await req.json();

  const kunde = await prisma.kundenprofil.update({
    where: { id },
    data: bereinigeDaten(daten),
  });

  return Response.json({ id: kunde.id });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const { id } = await params;

  await prisma.kundenprofil.delete({ where: { id } });

  return Response.json({ ok: true });
}

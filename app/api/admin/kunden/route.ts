import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const daten = await req.json();

  if (!daten.unternehmensname?.trim()) {
    return Response.json({ fehler: "Unternehmensname ist ein Pflichtfeld." }, { status: 400 });
  }

  const kunde = await prisma.kundenprofil.create({
    data: bereinigeDaten(daten),
  });

  return Response.json({ id: kunde.id }, { status: 201 });
}

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
    if (feld in daten) {
      ergebnis[feld] = daten[feld] === "" ? null : daten[feld];
    }
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

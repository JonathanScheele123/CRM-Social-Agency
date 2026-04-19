import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwortHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@agentur.de" },
    update: {},
    create: {
      email: "admin@agentur.de",
      name: "Admin",
      passwort: passwortHash,
      rolle: "ADMIN",
    },
  });

  console.log("Admin erstellt:", admin.email);

  // Demo-Kunde anlegen
  const demoKunde = await prisma.kundenprofil.upsert({
    where: { kundenNr: 1 },
    update: {},
    create: {
      unternehmensname: "Demo GmbH",
      ansprechpartner: "Max Mustermann",
      emailAnsprechpartner: "max@demo.de",
      branche: "Handwerk",
      kundenKategorie: "A-Kunde",
      statusKunde: "Aktiv – läuft gut",
      kundenzufriedenheit: "Sehr zufrieden",
      hauptziel: "Neue Mitarbeiter gewinnen",
      kurzbeschreibung: "Familiengeführter Handwerksbetrieb mit 20 Jahren Erfahrung.",
    },
  });

  console.log("Demo-Kunde erstellt:", demoKunde.unternehmensname);

  // Demo-Kalendereinträge
  await prisma.kalenderEintrag.createMany({
    skipDuplicates: true,
    data: [
      {
        kundenprofilId: demoKunde.id,
        titel: "Einblick Werkstatt – Reel",
        beschreibung: "Kurzer Reel aus der Werkstatt mit Mitarbeiter.",
        plattform: ["Instagram", "TikTok"],
        contentTyp: "Reel",
        geplantAm: new Date(),
        gepostet: false,
        prioritaet: "Hoch",
        captionText: "Ein Tag in unserer Werkstatt 🔧\n\nSeht mal hinter die Kulissen unserer täglichen Arbeit! Von der Planung bis zur Fertigstellung – so läuft ein typischer Tag bei uns ab.\n\n#Handwerk #Werkstatt #Einblick #HinterDenKulissen",
        freigabeStatus: "Ausstehend",
      },
      {
        kundenprofilId: demoKunde.id,
        titel: "Team-Vorstellung",
        beschreibung: "Vorstellung des neuen Auszubildenden.",
        plattform: ["Instagram"],
        contentTyp: "Bild",
        geplantAm: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        gepostet: false,
        prioritaet: "Mittel",
        captionText: "Willkommen im Team! 👋\n\nWir freuen uns, unseren neuen Auszubildenden vorzustellen. Er startet mit viel Motivation durch!\n\n#NeuesTeammitglied #Ausbildung #TeamVorstellung",
        freigabeStatus: "Ausstehend",
      },
      {
        kundenprofilId: demoKunde.id,
        titel: "Kundenprojekt vorher/nachher",
        beschreibung: "Karussell mit einem abgeschlossenen Projekt.",
        plattform: ["Instagram", "Facebook"],
        contentTyp: "Karussell",
        geplantAm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        gepostet: true,
        prioritaet: "Hoch",
        captionText: "Vorher – Nachher ✨\n\nSchaut euch den Unterschied an! Dieses Projekt hat uns viel Freude gemacht.",
        freigabeStatus: "Freigegeben",
        freigegebenAm: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        kundenprofilId: demoKunde.id,
        titel: "FAQ: Wie lange dauert eine Reparatur?",
        beschreibung: "Story-Serie mit häufigen Kundenfragen.",
        plattform: ["Instagram"],
        contentTyp: "Story",
        geplantAm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        gepostet: false,
        prioritaet: "Niedrig",
        captionText: "Slide 1: Wie lange dauert eine typische Reparatur?\nSlide 2: Das kommt auf den Schaden an...\nSlide 3: Für einfache Reparaturen: 1-2 Tage\nSlide 4: Schreibt uns direkt!",
        freigabeStatus: "Überarbeitung",
        freigabeKommentar: "Bitte die Slide-Texte etwas lockerer formulieren – klingt noch zu formal.",
        freigegebenAm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Demo-Content-Ideen
  await prisma.contentIdea.createMany({
    skipDuplicates: true,
    data: [
      {
        kundenprofilId: demoKunde.id,
        titel: "Zeitraffer Montage",
        beschreibung: "Zeitraffer-Video einer kompletten Montage von A bis Z.",
        plattform: ["Instagram", "TikTok"],
        contentTyp: "Reel",
        eingereichtVon: "Agentur",
        prioritaet: "Hoch",
        status: "Angenommen",
      },
      {
        kundenprofilId: demoKunde.id,
        titel: "FAQ: Was kostet ein Auftrag?",
        beschreibung: "Story-Serie mit häufigen Fragen von Kunden.",
        plattform: ["Instagram"],
        contentTyp: "Story",
        eingereichtVon: "Agentur",
        prioritaet: "Mittel",
        status: "Offen",
      },
      {
        kundenprofilId: demoKunde.id,
        titel: "Mitarbeiter des Monats",
        beschreibung: "Persönliches Interview-Format mit einem Mitarbeiter.",
        plattform: ["Instagram", "Facebook"],
        contentTyp: "Reel",
        eingereichtVon: "Kunde",
        prioritaet: "Mittel",
        status: "Offen",
      },
    ],
  });

  // Demo-Kundenlogin erstellen und zuordnen
  const kundenPasswort = await bcrypt.hash("kunde123", 12);
  const kundenUser = await prisma.user.upsert({
    where: { email: "kunde@demo.de" },
    update: {},
    create: {
      email: "kunde@demo.de",
      name: "Max Mustermann",
      passwort: kundenPasswort,
      rolle: "KUNDE",
    },
  });

  await prisma.kundenprofilZugriff.upsert({
    where: {
      userId_kundenprofilId: {
        userId: kundenUser.id,
        kundenprofilId: demoKunde.id,
      },
    },
    update: {},
    create: {
      userId: kundenUser.id,
      kundenprofilId: demoKunde.id,
    },
  });

  console.log("Kunden-Login erstellt:", kundenUser.email);
  console.log("\n✓ Seed abgeschlossen");
  console.log("  Admin:  admin@agentur.de / admin123");
  console.log("  Kunde:  kunde@demo.de / kunde123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

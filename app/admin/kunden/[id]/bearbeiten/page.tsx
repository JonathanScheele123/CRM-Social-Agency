import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KundenprofilForm, { KundenprofilFormDaten } from "@/components/admin/KundenprofilForm";

export default async function KundeBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  const kunde = await prisma.kundenprofil.findUnique({ where: { id } });
  if (!kunde) notFound();

  function datumZuString(d: Date | null): string {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  }

  const initialDaten: Partial<KundenprofilFormDaten> = {
    unternehmensname: kunde.unternehmensname ?? "",
    ansprechpartner: kunde.ansprechpartner ?? "",
    geschaeftsadresse: kunde.geschaeftsadresse ?? "",
    emailAnsprechpartner: kunde.emailAnsprechpartner ?? "",
    branche: kunde.branche ?? "",
    telefonnummer: kunde.telefonnummer ?? "",
    webseite: kunde.webseite ?? "",
    emailDirekt: kunde.emailDirekt ?? "",
    socialMediaKanaele: kunde.socialMediaKanaele ?? "",
    freigabeVerantwortlicher: kunde.freigabeVerantwortlicher ?? "",
    emailFreigabeVerantwortlicher: kunde.emailFreigabeVerantwortlicher ?? "",
    cloudLink: kunde.cloudLink ?? "",
    zusatzlinks: kunde.zusatzlinks ?? "",
    vertragsstart: datumZuString(kunde.vertragsstart),
    letzterKontakt: datumZuString(kunde.letzterKontakt),
    statusKunde: kunde.statusKunde ?? "",
    kundenKategorie: kunde.kundenKategorie ?? "",
    kundenzufriedenheit: kunde.kundenzufriedenheit ?? "",
    vertraglicheFestgelegtePostAnzahl: kunde.vertraglicheFestgelegtePostAnzahl?.toString() ?? "",
    archiv: kunde.archiv ?? "",
    kundenfeedback: kunde.kundenfeedback ?? "",
    notizenIntern: kunde.notizenIntern ?? "",
    contentIdeen: kunde.contentIdeen ?? "",
    contentPlan: kunde.contentPlan ?? [],
    postingKalender: kunde.postingKalender ?? "",
    besonderheitenPlanung: kunde.besonderheitenPlanung ?? "",
    mitarbeiterImBildRechtlichGeklaert: kunde.mitarbeiterImBildRechtlichGeklaert ?? "",
    mitarbeiterImBildRechtlichGeregelt: kunde.mitarbeiterImBildRechtlichGeregelt ?? "",
    mitarbeiterNichtZeigen: kunde.mitarbeiterNichtZeigen ?? "",
    welcheMitarbeiterNichtZeigen: kunde.welcheMitarbeiterNichtZeigen ?? "",
    sensibleBereiche: kunde.sensibleBereiche ?? "",
    welcheBereicheNichtZeigen: kunde.welcheBereicheNichtZeigen ?? "",
    drehtageAnWelchenTagen: kunde.drehtageAnWelchenTagen ?? [],
    drehtageUhrzeiten: kunde.drehtageUhrzeiten ?? "",
    ansprechpartnerDrehtag: kunde.ansprechpartnerDrehtag ?? "",
    einschraenkungenVorOrt: kunde.einschraenkungenVorOrt ?? "",
    selbstAuftreten: kunde.selbstAuftreten ?? "",
    wunschdatum: kunde.wunschdatum ? new Date(kunde.wunschdatum).toISOString().slice(0, 16) : "",
    kurzbeschreibung: kunde.kurzbeschreibung ?? "",
    kernwerte: kunde.kernwerte ?? "",
    alleinstellungsmerkmale: kunde.alleinstellungsmerkmale ?? "",
    haeufigsteProbleme: kunde.haeufigsteProbleme ?? "",
    haeufigsteEinwaende: kunde.haeufigsteEinwaende ?? "",
    zielgruppeOnline: kunde.zielgruppeOnline ?? "",
    wasKundenLieben: kunde.wasKundenLieben ?? "",
    zielgruppe: kunde.zielgruppe ?? "",
    hauptziel: kunde.hauptziel ?? "",
    heroProdukte: kunde.heroProdukte ?? "",
    wiederkehrendeProdukte: kunde.wiederkehrendeProdukte ?? "",
    eventsNaechsteMonate: kunde.eventsNaechsteMonate ?? "",
    herausforderungen: kunde.herausforderungen ?? "",
    vorbereiteteFragenBesprechen: kunde.vorbereiteteFragenBesprechen ?? "",
  };

  return (
    <KundenprofilForm modus="bearbeiten" kundeId={id} initialDaten={initialDaten} />
  );
}

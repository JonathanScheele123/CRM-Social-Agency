-- CreateEnum
CREATE TYPE "Rolle" AS ENUM ('ADMIN', 'KUNDE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwort" TEXT,
    "rolle" "Rolle" NOT NULL DEFAULT 'KUNDE',
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "KundenprofilZugriff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kundenprofilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KundenprofilZugriff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kundenprofil" (
    "id" TEXT NOT NULL,
    "kundenNr" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unternehmensname" TEXT,
    "ansprechpartner" TEXT,
    "geschaeftsadresse" TEXT,
    "emailAnsprechpartner" TEXT,
    "branche" TEXT,
    "telefonnummer" TEXT,
    "webseite" TEXT,
    "emailDirekt" TEXT,
    "socialMediaKanaele" TEXT,
    "freigabeVerantwortlicher" TEXT,
    "emailFreigabeVerantwortlicher" TEXT,
    "cloudLink" TEXT,
    "zusatzlinks" TEXT,
    "vertragsstart" TIMESTAMP(3),
    "statusKunde" TEXT,
    "kundenKategorie" TEXT,
    "letzterKontakt" TIMESTAMP(3),
    "kundenzufriedenheit" TEXT,
    "vertraglicheFestgelegtePostAnzahl" DOUBLE PRECISION,
    "archiv" TEXT,
    "kundenfeedback" TEXT,
    "notizenIntern" TEXT,
    "contentIdeen" TEXT,
    "contentPlan" TEXT[],
    "postingKalender" TEXT,
    "mitarbeiterImBildRechtlichGeklaert" TEXT,
    "mitarbeiterImBildRechtlichGeregelt" TEXT,
    "mitarbeiterNichtZeigen" TEXT,
    "welcheMitarbeiterNichtZeigen" TEXT,
    "sensibleBereiche" TEXT,
    "welcheBereicheNichtZeigen" TEXT,
    "drehtageAnWelchenTagen" TEXT[],
    "drehtageUhrzeiten" TEXT,
    "ansprechpartnerDrehtag" TEXT,
    "einschraenkungenVorOrt" TEXT,
    "selbstAuftreten" TEXT,
    "wunschdatum" TIMESTAMP(3),
    "kurzbeschreibung" TEXT,
    "kernwerte" TEXT,
    "alleinstellungsmerkmale" TEXT,
    "haeufigsteProbleme" TEXT,
    "haeufigsteEinwaende" TEXT,
    "zielgruppeOnline" TEXT,
    "wasKundenLieben" TEXT,
    "zielgruppe" TEXT,
    "hauptziel" TEXT,
    "heroProdukte" TEXT,
    "wiederkehrendeProdukte" TEXT,
    "eventsNaechsteMonate" TEXT,
    "besonderheitenPlanung" TEXT,
    "herausforderungen" TEXT,
    "vorbereiteteFragenBesprechen" TEXT,

    CONSTRAINT "Kundenprofil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentIdea" (
    "id" TEXT NOT NULL,
    "kundenprofilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titel" TEXT,
    "beschreibung" TEXT,
    "plattform" TEXT[],
    "contentTyp" TEXT,
    "eingereichtVon" TEXT,
    "einreichungsdatum" TIMESTAMP(3),
    "prioritaet" TEXT,
    "status" TEXT,
    "notizen" TEXT,
    "gewuenschtesPostingDatum" TIMESTAMP(3),
    "captionText" TEXT,
    "dateizugriff" TEXT,

    CONSTRAINT "ContentIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KalenderEintrag" (
    "id" TEXT NOT NULL,
    "kundenprofilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titel" TEXT,
    "beschreibung" TEXT,
    "plattform" TEXT[],
    "contentTyp" TEXT,
    "eingereichtVon" TEXT,
    "einreichungsdatum" TIMESTAMP(3),
    "prioritaet" TEXT,
    "notizen" TEXT,
    "captionText" TEXT,
    "dateizugriff" TEXT,
    "geplantAm" TIMESTAMP(3),
    "gepostet" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KalenderEintrag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivEintrag" (
    "id" TEXT NOT NULL,
    "kundenprofilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titel" TEXT,
    "beschreibung" TEXT,
    "plattform" TEXT[],
    "contentTyp" TEXT,
    "eingereichtVon" TEXT,
    "einreichungsdatum" TIMESTAMP(3),
    "prioritaet" TEXT,
    "notizen" TEXT,
    "captionText" TEXT,
    "dateizugriff" TEXT,
    "archivdatum" TIMESTAMP(3),
    "gepostetAm" TIMESTAMP(3),

    CONSTRAINT "ArchivEintrag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL,
    "kpiNr" SERIAL NOT NULL,
    "kundenprofilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "monatJahr" TEXT,
    "plattform" TEXT,
    "reichweite" INTEGER,
    "impressionen" INTEGER,
    "follower" INTEGER,
    "engagementRate" DOUBLE PRECISION,
    "kommentare" INTEGER,
    "likes" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "klicks" INTEGER,
    "reichweiteVormonat" INTEGER,
    "impressionenVormonat" INTEGER,
    "followerVormonat" INTEGER,
    "engagementRateVormonat" DOUBLE PRECISION,
    "kommentareVormonat" INTEGER,
    "likesVormonat" INTEGER,
    "sharesVormonat" INTEGER,
    "savesVormonat" INTEGER,
    "klicksVormonat" INTEGER,
    "reichweiteVor2M" INTEGER,
    "impressionenVor2M" INTEGER,
    "followerVor2M" INTEGER,
    "engagementRateVor2M" DOUBLE PRECISION,
    "kommentareVor2M" INTEGER,
    "likesVor2M" INTEGER,
    "sharesVor2M" INTEGER,
    "savesVor2M" INTEGER,
    "klicksVor2M" INTEGER,
    "analyseKommentar" TEXT,
    "handlungsempfehlungen" TEXT,
    "statusMonitoring" TEXT,
    "reportGesendet" BOOLEAN NOT NULL DEFAULT false,
    "kpiTyp" TEXT,
    "anomalieErkennung" TEXT,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kundendaten" (
    "id" TEXT NOT NULL,
    "kundenprofilId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "beschreibung" TEXT,
    "inhalt" TEXT,
    "veraltet" BOOLEAN NOT NULL DEFAULT false,
    "datum" TIMESTAMP(3),
    "tags" TEXT[],
    "hinzugefuegtVon" TEXT,
    "anhaenge" TEXT[],

    CONSTRAINT "Kundendaten_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "KundenprofilZugriff_userId_kundenprofilId_key" ON "KundenprofilZugriff"("userId", "kundenprofilId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KundenprofilZugriff" ADD CONSTRAINT "KundenprofilZugriff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KundenprofilZugriff" ADD CONSTRAINT "KundenprofilZugriff_kundenprofilId_fkey" FOREIGN KEY ("kundenprofilId") REFERENCES "Kundenprofil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentIdea" ADD CONSTRAINT "ContentIdea_kundenprofilId_fkey" FOREIGN KEY ("kundenprofilId") REFERENCES "Kundenprofil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KalenderEintrag" ADD CONSTRAINT "KalenderEintrag_kundenprofilId_fkey" FOREIGN KEY ("kundenprofilId") REFERENCES "Kundenprofil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivEintrag" ADD CONSTRAINT "ArchivEintrag_kundenprofilId_fkey" FOREIGN KEY ("kundenprofilId") REFERENCES "Kundenprofil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPI" ADD CONSTRAINT "KPI_kundenprofilId_fkey" FOREIGN KEY ("kundenprofilId") REFERENCES "Kundenprofil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kundendaten" ADD CONSTRAINT "Kundendaten_kundenprofilId_fkey" FOREIGN KEY ("kundenprofilId") REFERENCES "Kundenprofil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import KalenderTab from "./tabs/KalenderTab";
import ContentIdeenTab from "./tabs/ContentIdeenTab";
import KPITab from "./tabs/KPITab";
import KundendatenTab from "./tabs/KundendatenTab";
import ArchivTab from "./tabs/ArchivTab";
import FreigabeTab from "./tabs/FreigabeTab";

type Props = {
  kundenprofil: {
    id: string;
    unternehmensname: string | null;
    contentIdeen_: ContentIdea[];
    kalender: KalenderEintrag[];
    kpis: KPI[];
    kundendaten: Kundendaten[];
    archivEintraege: ArchivEintrag[];
    [key: string]: unknown;
  };
};

type ContentIdea = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  eingereichtVon: string | null;
  prioritaet: string | null;
  status: string | null;
  notizen: string | null;
  gewuenschtesPostingDatum: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
  createdAt: Date;
  kommentare: { id: string; text: string; autorTyp: string; autorName: string | null; createdAt: Date }[];
};

type KalenderEintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  geplantAm: Date | null;
  gepostet: boolean;
  captionText: string | null;
  dateizugriff: string | null;
  prioritaet: string | null;
  notizen: string | null;
  freigabeStatus: string;
  freigabeKommentar: string | null;
  freigegebenAm: Date | null;
};

type KPI = {
  id: string;
  monatJahr: string | null;
  plattform: string | null;
  reichweite: number | null;
  impressionen: number | null;
  follower: number | null;
  engagementRate: number | null;
  likes: number | null;
  kommentare: number | null;
  shares: number | null;
  saves: number | null;
  klicks: number | null;
  analyseKommentar: string | null;
  anomalieErkennung: string | null;
};

type Kundendaten = {
  id: string;
  beschreibung: string | null;
  inhalt: string | null;
  tags: string[];
  datum: Date | null;
  veraltet: boolean;
  hinzugefuegtVon: string | null;
};

type ArchivEintrag = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  gepostetAm: Date | null;
  captionText: string | null;
  dateizugriff: string | null;
};

const TABS = [
  { id: "freigabe", label: "Freigabe" },
  { id: "kalender", label: "Kalender" },
  { id: "ideen", label: "Content-Ideen" },
  { id: "kpis", label: "KPIs" },
  { id: "daten", label: "Kundendaten" },
  { id: "archiv", label: "Archiv" },
];

export default function KundenInterface({ kundenprofil }: Props) {
  const [aktuellerTab, setAktuellerTab] = useState("freigabe");
  const ausstehend = kundenprofil.kalender.filter((e) => e.freigabeStatus === "Ausstehend").length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              {(kundenprofil.unternehmensname ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="font-semibold text-sm sm:text-base">
                {kundenprofil.unternehmensname ?? "Mein Interface"}
              </h1>
              <p className="text-gray-500 text-xs hidden sm:block">Ihr Social Media Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAktuellerTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktuellerTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.id === "freigabe" && ausstehend > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs bg-blue-600 text-white rounded-full">
                  {ausstehend}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab-Inhalt */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {aktuellerTab === "freigabe" && (
          <FreigabeTab eintraege={kundenprofil.kalender} />
        )}
        {aktuellerTab === "kalender" && (
          <KalenderTab eintraege={kundenprofil.kalender} />
        )}
        {aktuellerTab === "ideen" && (
          <ContentIdeenTab ideen={kundenprofil.contentIdeen_} kundenprofilId={kundenprofil.id} />
        )}
        {aktuellerTab === "kpis" && (
          <KPITab kpis={kundenprofil.kpis} />
        )}
        {aktuellerTab === "daten" && (
          <KundendatenTab daten={kundenprofil.kundendaten} />
        )}
        {aktuellerTab === "archiv" && (
          <ArchivTab eintraege={kundenprofil.archivEintraege} />
        )}
      </main>
    </div>
  );
}

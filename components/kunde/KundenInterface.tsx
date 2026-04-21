"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import StartTab from "./tabs/StartTab";
import KalenderTab from "./tabs/KalenderTab";
import IdeenUndFreigabeTab from "./tabs/IdeenUndFreigabeTab";
import KPITab from "./tabs/KPITab";
import KundendatenTab from "./tabs/KundendatenTab";
import ArchivTab from "./tabs/ArchivTab";
import ThemeToggle from "@/components/ThemeToggle";
import PullToRefresh from "@/components/PullToRefresh";
import LangToggle from "@/components/LangToggle";
import { useT } from "@/lib/i18n";

type CoAdminInterface = { id: string; unternehmensname: string | null; kundenNr: number; kundenKategorie: string | null; statusKunde: string | null };

type Props = {
  kundenRolle?: string;
  coAdminInterfaces?: CoAdminInterface[];
  kundenprofil: {
    id: string;
    unternehmensname: string | null;
    vertraglicheFestgelegtePostAnzahl: number | null;
    limitReel: number | null;
    limitStory: number | null;
    limitBild: number | null;
    limitKarussell: number | null;
    limitGesperrtAb: Date | null;
    kpisFreigegeben: boolean;
    linkInstagram: string | null;
    linkFacebook: string | null;
    linkTikTok: string | null;
    linkYouTube: string | null;
    startVideoUrl: string | null;
    startFaqItems: string[];
    globalFaqItems: string[];
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

type KPIDatei = {
  id: string;
  name: string;
  url: string;
  typ: string;
  groesse: number | null;
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
  dateien: KPIDatei[];
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

type ArchivKommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
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
  kommentare: ArchivKommentar[];
};

const ERSTBESUCH_KEY = "kunde_besucht";

export default function KundenInterface({ kundenprofil, kundenRolle = "Inhaber", coAdminInterfaces }: Props) {
  const t = useT();
  const istMitarbeiter = kundenRolle === "Mitarbeiter";
  const BASE_TABS = [
    { id: "start", label: t.kundeInterface.start },
    { id: "kalender", label: t.kundeInterface.kalender },
    { id: "content", label: t.kundeInterface.content },
    { id: "kpis", label: t.kundeInterface.kpis },
    { id: "archiv", label: t.kundeInterface.archiv },
    { id: "daten", label: t.kundeInterface.kundendaten },
  ];
  const TABS = BASE_TABS.filter(tab => {
    if (tab.id === "kpis" && !kundenprofil.kpisFreigegeben) return false;
    if (tab.id === "daten" && istMitarbeiter) return false;
    return true;
  });

  const VALID_TAB_IDS = ["start", "kalender", "content", "kpis", "archiv", "daten"];

  const [aktuellerTab, setAktuellerTab] = useState("kalender");
  const offeneIdeen = kundenprofil.contentIdeen_.filter((i) => (i.status || "Offen") === "Offen").length;

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (VALID_TAB_IDS.includes(hash)) {
      setAktuellerTab(hash);
      return;
    }
    if (!localStorage.getItem(ERSTBESUCH_KEY)) {
      localStorage.setItem(ERSTBESUCH_KEY, "1");
      setAktuellerTab("start");
    }
  }, []);

  function tabWechseln(id: string) {
    setAktuellerTab(id);
    window.location.hash = id;
  }

  return (
    <div className="min-h-screen text-fg">
      <header className="sticky top-0 z-10 border-b border-divider px-4 sm:px-6 py-4 glass-bar">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JS Media" width={28} height={28} className="dark:hidden opacity-80 shrink-0" />
            <img src="/logo-white.png" alt="JS Media" width={28} height={28} className="hidden dark:block opacity-80 shrink-0" />
            <div>
              <h1 className="font-semibold text-sm sm:text-base text-fg">
                {kundenprofil.unternehmensname ?? t.kundeInterface.meinInterface}
              </h1>
              <p className="text-subtle text-xs hidden sm:block">{t.kundeInterface.dashboard}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {coAdminInterfaces && coAdminInterfaces.length > 1 && (
              <a
                href="/dashboard"
                className="text-muted hover:text-fg text-sm px-3 py-1.5 rounded-lg hover:bg-elevated transition-colors"
              >
                {t.nav.uebersicht}
              </a>
            )}
            <LangToggle />
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-muted hover:text-fg text-sm px-3 py-1.5 rounded-lg hover:bg-elevated transition-colors"
            >
              {t.common.abmelden}
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-divider px-4 sm:px-6 glass-bar">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto btn-group">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => tabWechseln(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktuellerTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {tab.label}
              {tab.id === "content" && offeneIdeen > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs bg-accent text-white rounded-full">
                  {offeneIdeen}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {aktuellerTab === "start" && <StartTab videoUrl={kundenprofil.startVideoUrl} faqItems={kundenprofil.startFaqItems} globalFaqItems={kundenprofil.globalFaqItems} />}
        {aktuellerTab === "kalender" && (
          <PullToRefresh>
            <KalenderTab
            eintraege={kundenprofil.kalender}
            onNavigiereZuContent={() => tabWechseln("content")}
            socialLinks={{
              instagram: kundenprofil.linkInstagram,
              facebook: kundenprofil.linkFacebook,
              tiktok: kundenprofil.linkTikTok,
              youtube: kundenprofil.linkYouTube,
            }}
          />
          </PullToRefresh>
        )}
        {aktuellerTab === "content" && (
          <PullToRefresh>
            <IdeenUndFreigabeTab
              ideen={kundenprofil.contentIdeen_}
              kundenprofilId={kundenprofil.id}
              postLimit={kundenprofil.vertraglicheFestgelegtePostAnzahl}
              postLimits={{ Reel: kundenprofil.limitReel, Story: kundenprofil.limitStory, Bild: kundenprofil.limitBild, Karussell: kundenprofil.limitKarussell }}
              limitGesperrtAb={kundenprofil.limitGesperrtAb}
            />
          </PullToRefresh>
        )}
        {aktuellerTab === "kpis" && kundenprofil.kpisFreigegeben && (
          <PullToRefresh>
            <KPITab kpis={kundenprofil.kpis} />
          </PullToRefresh>
        )}
        {aktuellerTab === "daten" && !istMitarbeiter && (
          <PullToRefresh>
            <KundendatenTab daten={kundenprofil.kundendaten} kundenprofilId={kundenprofil.id} profil={kundenprofil} />
          </PullToRefresh>
        )}
        {aktuellerTab === "archiv" && (
          <PullToRefresh>
            <ArchivTab eintraege={kundenprofil.archivEintraege} />
          </PullToRefresh>
        )}
      </main>
    </div>
  );
}

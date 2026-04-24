"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminKalenderTab from "@/components/admin/AdminKalenderTab";
import AdminContentIdeenTab from "@/components/admin/AdminContentIdeenTab";
import ContentIdeenModal from "@/components/admin/ContentIdeenModal";
import AdminKundendatenTab from "@/components/admin/AdminKundendatenTab";
import AdminArchivTab from "@/components/admin/AdminArchivTab";
import BenutzerModal from "@/components/admin/BenutzerModal";
import KPITab from "@/components/kunde/tabs/KPITab";
import ContentPlanenTab from "@/components/kunde/tabs/ContentPlanenTab";
import IdeenUndFreigabeTab from "@/components/kunde/tabs/IdeenUndFreigabeTab";
import { FreigabeIdee } from "@/components/shared/FreigabeListeAnsicht";
import ThemeToggle from "@/components/ThemeToggle";
import PullToRefresh from "@/components/PullToRefresh";
import DriveTab from "@/components/admin/DriveTab";
import PostfachTab from "@/components/admin/PostfachTab";
import SocialAccountsTab from "@/components/admin/SocialAccountsTab";
import { useT, useLang } from "@/lib/i18n";

type AllesKundenprofil = { id: string; unternehmensname: string | null; kundenNr: number };

type PostLimitsNachTyp = {
  Reel: number | null;
  Story: number | null;
  Bild: number | null;
  Karussell: number | null;
};

type KundeDetailProps = {
  kunde: {
    id: string;
    kundenNr: number;
    unternehmensname: string | null;
    ansprechpartner: string | null;
    emailAnsprechpartner: string | null;
    freigabeVerantwortlicher: string | null;
    emailFreigabeVerantwortlicher: string | null;
    freigabeVerantwortlicher2: string | null;
    emailFreigabeVerantwortlicher2: string | null;
    branche: string | null;
    telefonnummer: string | null;
    statusKunde: string | null;
    cloudLink: string | null;
    linkInstagram: string | null;
    linkFacebook: string | null;
    linkTikTok: string | null;
    linkYouTube: string | null;
    vertraglicheFestgelegtePostAnzahl: number | null;
    limitReel: number | null;
    limitStory: number | null;
    limitBild: number | null;
    limitKarussell: number | null;
    limitGesperrtAb: Date | null;
    notizenIntern: string | null;
    startVideoUrl: string | null;
    startFaqItems: string[];
    dsgvoLoeschdatum: Date | null;
    dsgvoStatus: string | null;
    keinMarketing: boolean;
    verarbeitungEinschraenken: boolean;
    zugriffe: Array<{
      id: string;
      kundenRolle: string;
      user: { id: string; name: string | null; email: string; rolle: string; aktiv: boolean };
    }>;
    contentIdeen_: Parameters<typeof AdminContentIdeenTab>[0]["ideen"];
    kalender: Parameters<typeof AdminKalenderTab>[0]["eintraege"];
    kpis: Parameters<typeof KPITab>[0]["kpis"];
    kpisFreigegeben: boolean;
    kundendaten: Parameters<typeof AdminKundendatenTab>[0]["daten"];
    archivEintraege: Parameters<typeof AdminArchivTab>[0]["eintraege"];
  };
  alleKunden: AllesKundenprofil[];
};

const VALID_TABS = ["kalender", "ideen", "planen", "kpis", "daten", "archiv", "drive", "social", "einstellungen"];


function AdminContentWrapper({
  ideen,
  kundenprofilId,
  vertraglichePostAnzahl,
  postLimits,
  limitGesperrtAb,
}: {
  ideen: KundeDetailProps["kunde"]["contentIdeen_"];
  kundenprofilId: string;
  vertraglichePostAnzahl: number | null;
  postLimits: PostLimitsNachTyp;
  limitGesperrtAb: Date | null;
}) {
  const t = useT();
  const ANSICHT_KEY = `admin_content_ansicht_${kundenprofilId}`;
  const [ansicht, setAnsicht] = useState<"admin" | "kunde">(() => {
    if (typeof window !== "undefined") {
      const g = localStorage.getItem(ANSICHT_KEY);
      if (g === "admin" || g === "kunde") return g;
    }
    return "admin";
  });
  const [bearbeitenIdee, setBearbeitenIdee] = useState<FreigabeIdee | null>(null);
  const [lokalGesperrtAb, setLokalGesperrtAb] = useState<Date | null>(
    limitGesperrtAb ? new Date(limitGesperrtAb) : null
  );

  function ansichtWechseln(a: "admin" | "kunde") {
    setAnsicht(a);
    localStorage.setItem(ANSICHT_KEY, a);
  }

  return (
    <div>
      <div className="flex items-center gap-1 bg-elevated border border-divider rounded-xl p-1 mb-6 w-fit btn-group">
        <button
          onClick={() => ansichtWechseln("admin")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            ansicht === "admin" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {t.kundeDetailView.adminAnsicht}
        </button>
        <button
          onClick={() => ansichtWechseln("kunde")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            ansicht === "kunde" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {t.kundeDetailView.kundenansicht}
        </button>
      </div>

      {ansicht === "admin" && (
        <AdminContentIdeenTab
          ideen={ideen}
          kundenprofilId={kundenprofilId}
          vertraglichePostAnzahl={vertraglichePostAnzahl}
          limitGesperrtAb={lokalGesperrtAb}
          onEntsperre={() => setLokalGesperrtAb(null)}
        />
      )}
      {ansicht === "kunde" && (
        <IdeenUndFreigabeTab
          ideen={ideen}
          kundenprofilId={kundenprofilId}
          postLimit={vertraglichePostAnzahl}
          postLimits={postLimits}
          onBearbeiten={setBearbeitenIdee}
          limitGesperrtAb={lokalGesperrtAb}
          onLimitChange={setLokalGesperrtAb}
        />
      )}

      {bearbeitenIdee && (
        <ContentIdeenModal
          idee={bearbeitenIdee as Parameters<typeof ContentIdeenModal>[0]["idee"]}
          kundenprofilId={kundenprofilId}
          onClose={() => setBearbeitenIdee(null)}
        />
      )}
    </div>
  );
}

export default function KundeDetailView({ kunde, alleKunden }: KundeDetailProps) {
  const router = useRouter();
  const t = useT();
  const [aktuellerTab, setAktuellerTab] = useState("kalender");
  const [sharedIdeen, setSharedIdeen] = useState(kunde.contentIdeen_);

  const TABS = [
    { id: "kalender", label: t.kundeDetailView.kalender },
    { id: "ideen", label: t.kundeDetailView.contentIdeen },
    { id: "planen", label: t.kundeDetailView.contentPlanen },
    { id: "kpis", label: t.kundeDetailView.kpis },
    { id: "daten", label: t.kundeDetailView.kundendaten },
    { id: "archiv", label: t.kundeDetailView.archiv },
    { id: "drive", label: t.kundeDetailView.googleWorkspace },
    { id: "social", label: "Social Media" },
    { id: "einstellungen", label: t.kundeDetailView.einstellungen },
  ];

  // Sync with fresh server data after router.refresh()
  useEffect(() => {
    setSharedIdeen(kunde.contentIdeen_);
  }, [kunde.contentIdeen_]);

  function ideaEntfernen(id: string) {
    setSharedIdeen(prev => prev.filter(i => i.id !== id));
  }

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (VALID_TABS.includes(hash)) setAktuellerTab(hash);
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
            <button
              onClick={() => router.push("/dashboard")}
              className="text-muted hover:text-fg text-sm transition-colors"
            >
              {t.nav.uebersicht}
            </button>
            <span className="text-subtle">/</span>
            <div>
              <span className="font-serif font-bold italic text-fg text-lg tracking-tight">{kunde.unternehmensname ?? "Kunde"}</span>
              <span className="text-subtle text-xs ml-2">#{kunde.kundenNr}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/admin/kunden/${kunde.id}/bearbeiten`)}
              className="bg-elevated hover:bg-elevated/80 text-fg text-sm px-3 py-1.5 rounded-lg transition-colors border border-divider"
            >
              <span className="hidden sm:inline">{t.kundeDetailView.interneKundendaten}</span>
              <span className="sm:hidden">✎</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="border-b border-divider px-4 sm:px-6 glass-bar">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto btn-group">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => tabWechseln(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                aktuellerTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {aktuellerTab === "kalender" && (
          <PullToRefresh>
            <AdminKalenderTab
                eintraege={kunde.kalender}
                kundenprofilId={kunde.id}
                onNavigiereZuIdeen={() => tabWechseln("ideen")}
                socialLinks={{
                  instagram: kunde.linkInstagram,
                  facebook: kunde.linkFacebook,
                  tiktok: kunde.linkTikTok,
                  youtube: kunde.linkYouTube,
                }}
              />
          </PullToRefresh>
        )}
        {aktuellerTab === "ideen" && (
          <PullToRefresh>
            <AdminContentWrapper
              ideen={sharedIdeen}
              kundenprofilId={kunde.id}
              vertraglichePostAnzahl={kunde.vertraglicheFestgelegtePostAnzahl}
              postLimits={{ Reel: kunde.limitReel, Story: kunde.limitStory, Bild: kunde.limitBild, Karussell: kunde.limitKarussell }}
              limitGesperrtAb={kunde.limitGesperrtAb}
            />
          </PullToRefresh>
        )}
        {aktuellerTab === "kpis" && (
          <PullToRefresh>
            <KPITab
              kpis={kunde.kpis}
              isAdmin
              kundenprofilId={kunde.id}
              kpisFreigegeben={kunde.kpisFreigegeben}
            />
          </PullToRefresh>
        )}
        {aktuellerTab === "daten" && <PullToRefresh><AdminKundendatenTab daten={kunde.kundendaten} kundenprofilId={kunde.id} profil={kunde} /></PullToRefresh>}
        {aktuellerTab === "planen" && <PullToRefresh><ContentPlanenTab ideen={sharedIdeen} kundenprofilId={kunde.id} cloudLink={kunde.cloudLink} onIdeaAktiviert={ideaEntfernen} drehtag={(kunde as any).drehtag ?? null} drehtageAdresse={(kunde as any).drehtageAdresse ?? null} drehtageStatus={(kunde as any).drehtageStatus ?? null} /></PullToRefresh>}
        {aktuellerTab === "archiv" && <PullToRefresh><AdminArchivTab eintraege={kunde.archivEintraege} kundenprofilId={kunde.id} /></PullToRefresh>}
        {aktuellerTab === "drive" && <DrivePostfachBereich cloudLink={kunde.cloudLink} kundenprofilId={kunde.id} />}
        {aktuellerTab === "social" && <PullToRefresh><SocialAccountsTab kundenprofilId={kunde.id} /></PullToRefresh>}
        {aktuellerTab === "einstellungen" && (
          <EinstellungenTab kunde={kunde} alleKunden={alleKunden} />
        )}
      </main>
    </div>
  );
}

// ── Drive + Postfach Sub-Tab ─────────────────────────────────────────────────

function DrivePostfachBereich({ cloudLink: initialCloudLink, kundenprofilId }: { cloudLink: string | null; kundenprofilId: string }) {
  const t = useT();
  const [ansicht, setAnsicht] = useState<"drive" | "postfach">("drive");
  const [cloudLink, setCloudLink] = useState(initialCloudLink);
  const [ordnerLaden, setOrdnerLaden] = useState(false);
  const [ordnerFehler, setOrdnerFehler] = useState("");

  async function handleOrdnerErstellen() {
    setOrdnerLaden(true);
    setOrdnerFehler("");
    try {
      const res = await fetch(`/api/admin/kunden/${kundenprofilId}/drive`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler ?? "Ordner konnte nicht erstellt werden.");
      setCloudLink(data.cloudLink);
    } catch (err) {
      setOrdnerFehler(err instanceof Error ? err.message : "Fehler beim Erstellen.");
    } finally {
      setOrdnerLaden(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1 bg-elevated border border-divider rounded-xl p-1 mb-6 w-fit btn-group">
        <button
          onClick={() => setAnsicht("drive")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            ansicht === "drive" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {t.kundeDetailView.drive}
        </button>
        <button
          onClick={() => setAnsicht("postfach")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            ansicht === "postfach" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
          }`}
        >
          {t.kundeDetailView.postfach}
        </button>
      </div>
      {ansicht === "drive" && !cloudLink && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <p className="text-subtle text-sm">Kein Google Drive-Ordner verknüpft.</p>
          {ordnerFehler && <p className="text-red-500 text-xs max-w-sm">{ordnerFehler}</p>}
          <button
            onClick={handleOrdnerErstellen}
            disabled={ordnerLaden}
            className="flex items-center gap-2 text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-2 rounded-xl transition-colors font-medium"
          >
            {ordnerLaden ? "Wird erstellt…" : "Drive-Ordner anlegen"}
          </button>
        </div>
      )}
      {ansicht === "drive" && cloudLink && <DriveTab cloudLink={cloudLink} />}
      {ansicht === "postfach" && <PostfachTab kundenprofilId={kundenprofilId} />}
    </div>
  );
}

// ── Datenschutz-Tab ──────────────────────────────────────────────────────────

type AuditEintrag = { id: string; createdAt: Date; aktion: string; benutzerEmail: string | null; details: string | null };

function DatenschutzTab({ kunde }: { kunde: KundeDetailProps["kunde"] }) {
  const router = useRouter();
  const t = useT();
  const { lang } = useLang();
  const [dsgvoStatus, setDsgvoStatus] = useState(kunde.dsgvoStatus ?? "aktiv");
  const [loeschdatum, setLoeschdatum] = useState(
    kunde.dsgvoLoeschdatum ? new Date(kunde.dsgvoLoeschdatum).toISOString().slice(0, 10) : ""
  );
  const [keinMarketing, setKeinMarketing] = useState(kunde.keinMarketing);
  const [einschraenken, setEinschraenken] = useState(kunde.verarbeitungEinschraenken);
  const [speichern, setSpeichern] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [auditLogs, setAuditLogs] = useState<AuditEintrag[]>([]);
  const [auditLaden, setAuditLaden] = useState(false);
  const [auditOffen, setAuditOffen] = useState(false);
  const [exportLaden, setExportLaden] = useState(false);
  const [anonBestaetigen, setAnonBestaetigen] = useState(false);

  const loeschWarnungTage = loeschdatum
    ? Math.ceil((new Date(loeschdatum).getTime() - Date.now()) / 86400000)
    : null;

  const dateLocale = lang === "de" ? "de-DE" : "en-GB";

  async function handleSave() {
    setSpeichern("saving");
    const res = await fetch(`/api/admin/kunden/${kunde.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dsgvoStatus,
        dsgvoLoeschdatum: loeschdatum || null,
        keinMarketing,
        verarbeitungEinschraenken: einschraenken,
      }),
    });
    setSpeichern(res.ok ? "saved" : "error");
    setTimeout(() => setSpeichern("idle"), 2500);
  }

  async function handleExport() {
    setExportLaden(true);
    const res = await fetch(`/api/admin/kunden/${kunde.id}/export`);
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${kunde.unternehmensname ?? kunde.id}_export.json`;
      a.click();
    }
    setExportLaden(false);
  }

  async function handleAnonymisieren() {
    const res = await fetch(`/api/admin/kunden/${kunde.id}/anonymisieren`, { method: "POST" });
    if (res.ok) router.push("/dashboard");
  }

  async function ladeAudit() {
    setAuditLaden(true);
    const res = await fetch(`/api/admin/kunden/${kunde.id}/audit`);
    if (res.ok) {
      const data = await res.json();
      setAuditLogs(data.logs.map((l: AuditEintrag) => ({ ...l, createdAt: new Date(l.createdAt) })));
    }
    setAuditLaden(false);
  }

  function toggleAudit() {
    if (!auditOffen && auditLogs.length === 0) ladeAudit();
    setAuditOffen(v => !v);
  }

  const AKTIONS_FARBEN: Record<string, string> = {
    exportiert: "text-blue-500",
    anonymisiert: "text-red-500",
    geloescht: "text-red-600",
    geaendert: "text-yellow-500",
    zugegriffen: "text-muted",
  };

  return (
    <div className="max-w-2xl space-y-4">

      {/* Löschdatum-Warnung */}
      {loeschWarnungTage !== null && loeschWarnungTage <= 30 && (
        <div className={`rounded-2xl px-5 py-4 border text-sm ${
          loeschWarnungTage <= 0
            ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
            : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
        }`}>
          {loeschWarnungTage <= 0
            ? `${t.kundeDetailView.loeschfristAbgelaufen} (${new Date(loeschdatum).toLocaleDateString(dateLocale)}). ${t.kundeDetailView.loeschfristPflicht}`
            : `${t.kundeDetailView.loeschfristNoch} ${loeschWarnungTage} ${t.kundeDetailView.tagen} (${new Date(loeschdatum).toLocaleDateString(dateLocale)}).`}
        </div>
      )}

      {/* DSGVO-Felder */}
      <div className="glass-modal rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-fg">{t.kundeDetailView.datenschutzStatus}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.kundeDetailView.statusLabel}</label>
            <select
              value={dsgvoStatus}
              onChange={e => setDsgvoStatus(e.target.value)}
              className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
            >
              <option value="aktiv">{t.kundeDetailView.aktiv}</option>
              <option value="eingeschraenkt">{t.kundeDetailView.eingeschraenkt}</option>
              <option value="loeschung_beantragt">{t.kundeDetailView.loeschungBeantragt}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.kundeDetailView.loeschdatum}</label>
            <input
              type="date"
              value={loeschdatum}
              onChange={e => setLoeschdatum(e.target.value)}
              className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={keinMarketing} onChange={e => setKeinMarketing(e.target.checked)}
              className="w-4 h-4 accent-accent rounded" />
            <span className="text-sm text-fg">{t.kundeDetailView.keinMarketing}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={einschraenken} onChange={e => setEinschraenken(e.target.checked)}
              className="w-4 h-4 accent-accent rounded" />
            <span className="text-sm text-fg">{t.kundeDetailView.verarbeitungEinschraenken}</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          {speichern === "error" && <span className="text-xs text-red-500">{t.common.fehler}</span>}
          {speichern === "saved" && <span className="text-xs text-green-500">{t.common.gespeichert}</span>}
          <button onClick={handleSave} disabled={speichern === "saving"}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            {speichern === "saving" ? t.kundeDetailView.speichert : t.common.speichern}
          </button>
        </div>
      </div>

      {/* Aktionen */}
      <div className="glass-modal rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-fg mb-4">{t.kundeDetailView.betroffenenrechte}</h3>
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-fg">{t.kundeDetailView.datenExportieren}</p>
              <p className="text-xs text-subtle mt-0.5">{t.kundeDetailView.exportBeschreibung}</p>
            </div>
            <button onClick={handleExport} disabled={exportLaden}
              className="shrink-0 text-sm px-3 py-1.5 rounded-xl bg-elevated border border-divider text-fg hover:border-accent transition-colors disabled:opacity-50">
              {exportLaden ? t.common.laden : t.kundeDetailView.exportieren}
            </button>
          </div>

          <div className="border-t border-divider pt-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-fg">{t.kundeDetailView.anonymisierenLoeschen}</p>
              <p className="text-xs text-subtle mt-0.5">{t.kundeDetailView.anonymisierenBeschreibung}</p>
            </div>
            {!anonBestaetigen ? (
              <button onClick={() => setAnonBestaetigen(true)}
                className="shrink-0 text-sm px-3 py-1.5 rounded-xl bg-elevated border border-red-300 dark:border-red-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                {t.kundeDetailView.anonymisieren}
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-red-500">{t.common.sicher}</span>
                <button onClick={handleAnonymisieren}
                  className="text-xs px-3 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium">
                  {t.common.jaJetzt}
                </button>
                <button onClick={() => setAnonBestaetigen(false)}
                  className="text-xs px-2 py-1.5 rounded-xl bg-elevated border border-divider text-muted hover:text-fg transition-colors">
                  {t.common.abbrechen}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit-Log */}
      <div className="glass-modal rounded-2xl p-5 shadow-sm">
        <button onClick={toggleAudit}
          className="w-full flex items-center justify-between text-left">
          <h3 className="font-semibold text-fg">{t.kundeDetailView.auditLog}</h3>
          <span className={`text-muted text-xs transition-transform duration-150 ${auditOffen ? "rotate-180" : ""}`}>▼</span>
        </button>
        {auditOffen && (
          <div className="mt-4">
            {auditLaden ? (
              <p className="text-subtle text-sm">{t.common.laden}</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-subtle text-sm">{t.common.keineEintraege}</p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-divider last:border-0">
                    <span className="text-xs text-subtle shrink-0 mt-0.5 w-28">
                      {new Date(log.createdAt).toLocaleString(dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`text-xs font-medium shrink-0 w-24 ${AKTIONS_FARBEN[log.aktion] ?? "text-muted"}`}>
                      {log.aktion}
                    </span>
                    <span className="text-xs text-muted truncate">{log.benutzerEmail ?? "–"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Start-Seite Editor ────────────────────────────────────────────────────────

type GlobalFaqItem = { id?: string; frage: string };

function GlobalFaqEditor() {
  const t = useT();
  const [items, setItems] = useState<GlobalFaqItem[]>([]);
  const [geladen, setGeladen] = useState(false);
  const [neuesFaq, setNeuesFaq] = useState("");
  const [speichern, setSpeichern] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/admin/global-faq")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setItems(data.items); })
      .finally(() => setGeladen(true));
  }, []);

  async function handleSave() {
    setSpeichern("saving");
    const res = await fetch("/api/admin/global-faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    setSpeichern(res.ok ? "saved" : "error");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
    setTimeout(() => setSpeichern("idle"), 2500);
  }

  function hinzufuegen() {
    const text = neuesFaq.trim();
    if (!text) return;
    setItems(prev => [...prev, { frage: text }]);
    setNeuesFaq("");
  }

  function aendern(i: number, val: string) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, frage: val } : item));
  }

  function entfernen(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i));
  }

  return (
    <div className="border-t border-divider pt-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-fg">{t.kundeDetailView.globaleStandardFaq}</p>
          <p className="text-xs text-subtle mt-0.5">{t.kundeDetailView.globaleStandardFaqHinweis}</p>
        </div>
        <div className="flex items-center gap-2">
          {speichern === "error" && <span className="text-xs text-red-500">{t.common.fehler}</span>}
          {speichern === "saved" && <span className="text-xs text-green-500">{t.common.gespeichert}</span>}
          <button onClick={handleSave} disabled={speichern === "saving"}
            className="text-xs bg-elevated border border-divider text-fg px-3 py-1.5 rounded-lg hover:border-accent transition-colors disabled:opacity-50">
            {speichern === "saving" ? t.kundeDetailView.speichert : t.common.speichern}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={item.frage} onChange={e => aendern(i, e.target.value)}
              className="flex-1 bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-accent transition-colors" />
            <button onClick={() => entfernen(i)}
              className="text-muted hover:text-red-500 transition-colors px-2 py-1 text-lg leading-none">×</button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-subtle italic">{t.kundeDetailView.keineGlobalenFaq}</p>
        )}
      </div>

      <div className="flex gap-2">
        <input type="text" value={neuesFaq} onChange={e => setNeuesFaq(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), hinzufuegen())}
          placeholder={t.kundeDetailView.neueFrage}
          className="flex-1 bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors" />
        <button onClick={hinzufuegen} disabled={!neuesFaq.trim()}
          className="bg-elevated border border-divider text-fg text-sm px-3 py-2 rounded-xl hover:border-accent transition-colors disabled:opacity-40">
          + {t.common.hinzufuegen}
        </button>
      </div>
    </div>
  );
}

function StartSeiteEditor({ kunde }: { kunde: KundeDetailProps["kunde"] }) {
  const t = useT();
  const [videoUrl, setVideoUrl] = useState(kunde.startVideoUrl ?? "");
  const [faqItems, setFaqItems] = useState<string[]>(kunde.startFaqItems ?? []);
  const [neuesFaq, setNeuesFaq] = useState("");
  const [speichern, setSpeichern] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSave() {
    setSpeichern("saving");
    const res = await fetch(`/api/admin/kunden/${kunde.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startVideoUrl: videoUrl, startFaqItems: faqItems }),
    });
    setSpeichern(res.ok ? "saved" : "error");
    setTimeout(() => setSpeichern("idle"), 2500);
  }

  function faqHinzufuegen() {
    const text = neuesFaq.trim();
    if (!text) return;
    setFaqItems(prev => [...prev, text]);
    setNeuesFaq("");
  }

  function faqEntfernen(i: number) {
    setFaqItems(prev => prev.filter((_, idx) => idx !== i));
  }

  function faqAendern(i: number, val: string) {
    setFaqItems(prev => prev.map((item, idx) => idx === i ? val : item));
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs text-muted block mb-1.5">{t.kundeDetailView.videoUrl}</label>
        <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
          placeholder={t.kundeDetailView.videoUrlPlaceholder}
          className="w-full bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2.5 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors" />
        <p className="text-xs text-subtle mt-1">{t.kundeDetailView.videoHinweis}</p>
      </div>

      <div>
        <label className="text-xs text-muted block mb-2">{t.kundeDetailView.kundenspezifischeFaq}</label>
        <p className="text-xs text-subtle mb-2">{t.kundeDetailView.kundenspezFaqHinweis}</p>
        <div className="space-y-2 mb-3">
          {faqItems.length === 0 && (
            <p className="text-xs text-subtle italic">{t.kundeDetailView.keineKundenspez}</p>
          )}
          {faqItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={item} onChange={e => faqAendern(i, e.target.value)}
                className="flex-1 bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-accent transition-colors" />
              <button onClick={() => faqEntfernen(i)}
                className="text-muted hover:text-red-500 transition-colors px-2 py-1 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={neuesFaq} onChange={e => setNeuesFaq(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), faqHinzufuegen())}
            placeholder={t.kundeDetailView.neueFrage2}
            className="flex-1 bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 placeholder:text-subtle focus:outline-none focus:border-accent transition-colors" />
          <button onClick={faqHinzufuegen} disabled={!neuesFaq.trim()}
            className="bg-elevated border border-divider text-fg text-sm px-3 py-2 rounded-xl hover:border-accent transition-colors disabled:opacity-40">
            + {t.common.hinzufuegen}
          </button>
        </div>
      </div>

      <GlobalFaqEditor />

      <div className="flex items-center justify-end gap-3 pt-1">
        {speichern === "error" && <span className="text-xs text-red-500">{t.kundeDetailView.fehlerSpeichern}</span>}
        {speichern === "saved" && <span className="text-xs text-green-500">{t.common.gespeichert}</span>}
        <button onClick={handleSave} disabled={speichern === "saving"}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
          {speichern === "saving" ? t.kundeDetailView.speichert : t.common.speichern}
        </button>
      </div>
    </div>
  );
}

function KlappSektion({
  titel,
  children,
  standardOffen = true,
  headerRechts,
}: {
  titel: string;
  children: React.ReactNode;
  standardOffen?: boolean;
  headerRechts?: React.ReactNode;
}) {
  const [offen, setOffen] = useState(standardOffen);
  return (
    <div className="glass-modal rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={() => setOffen(v => !v)}
          className="flex-1 flex items-center justify-between text-left gap-3 min-w-0"
        >
          <h3 className="font-semibold text-fg">{titel}</h3>
          <span className={`text-muted text-xs transition-transform duration-150 shrink-0 ${offen ? "rotate-180" : ""}`}>▼</span>
        </button>
        {headerRechts && <div className="ml-3 shrink-0">{headerRechts}</div>}
      </div>
      {offen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function ZugriffZeile({
  zugriff,
  onBearbeiten,
}: {
  zugriff: KundeDetailProps["kunde"]["zugriffe"][number];
  onBearbeiten: () => void;
}) {
  const t = useT();
  const [rolle, setRolle] = useState(zugriff.kundenRolle);
  const [speichert, setSpeichert] = useState(false);

  async function rolleAendern(neueRolle: string) {
    setRolle(neueRolle);
    setSpeichert(true);
    await fetch(`/api/admin/zugriff/${zugriff.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kundenRolle: neueRolle }),
    });
    setSpeichert(false);
  }

  return (
    <div className="flex items-center justify-between py-2.5 px-2 rounded-xl border-b border-divider last:border-0">
      <button onClick={onBearbeiten} className="text-left flex-1 min-w-0">
        <p className="text-sm text-fg">{zugriff.user.name ?? zugriff.user.email}</p>
        <p className="text-xs text-muted">{zugriff.user.email}</p>
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={rolle}
          onChange={(e) => rolleAendern(e.target.value)}
          disabled={speichert}
          onClick={(e) => e.stopPropagation()}
          className="text-xs bg-elevated border border-divider text-fg rounded-lg px-2 py-1 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
        >
          <option value="Inhaber">{t.kundeDetailView.inhaber}</option>
          <option value="Mitarbeiter">{t.kundeDetailView.mitarbeiter}</option>
          <option value="Co-Admin">{t.kundeDetailView.coAdmin}</option>
        </select>
        <span className={`text-xs px-2 py-0.5 rounded-lg ${zugriff.user.aktiv ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300" : "bg-elevated text-subtle"}`}>
          {zugriff.user.aktiv ? t.common.aktiv : t.common.inaktiv}
        </span>
        <button onClick={onBearbeiten} className="text-subtle text-sm hover:text-fg transition-colors">›</button>
      </div>
    </div>
  );
}

function BenutzerSchnellForm({
  kundenprofilId,
  onErfolg,
}: {
  kundenprofilId: string;
  onErfolg: () => void;
}) {
  const router = useRouter();
  const t = useT();
  const [offen, setOffen] = useState(false);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email.trim()) return;
    setLaden(true);
    setFehler("");
    const res = await fetch("/api/admin/benutzer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        kundenprofilIds: [kundenprofilId],
        kundenRolle: "Inhaber",
        sendeWillkommensEmail: true,
      }),
    });
    setLaden(false);
    if (!res.ok) {
      const d = await res.json();
      setFehler(d.fehler ?? t.common.fehlerAufgetreten);
      return;
    }
    setForm({ name: "", email: "" });
    setOffen(false);
    onErfolg();
    router.refresh();
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="text-sm text-accent hover:text-accent-hover transition-colors"
      >
        {t.kundeDetailView.benutzerHinzufuegen}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-elevated border border-divider rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">{t.kundeDetailView.name}</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder={t.kundeDetailView.namePlaceholder}
            className="w-full bg-card border border-divider text-fg rounded-lg px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">{t.kundeDetailView.email}</label>
          <input
            type="email"
            required
            autoFocus
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder={t.kundeDetailView.emailPlaceholder}
            className="w-full bg-card border border-divider text-fg rounded-lg px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      <p className="text-xs text-subtle">{t.kundeDetailView.loginHinweis}</p>
      {fehler && <p className="text-xs text-red-600 dark:text-red-400">{fehler}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => { setOffen(false); setFehler(""); }}
          className="text-sm text-muted hover:text-fg transition-colors px-3 py-1.5">
          {t.common.abbrechen}
        </button>
        <button type="submit" disabled={laden || !form.email.trim()}
          className="text-sm bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition-colors">
          {laden ? "…" : t.kundeDetailView.hinzufuegenEmail}
        </button>
      </div>
    </form>
  );
}

function FormularMailSenden({
  kundeId: kundenprofilId,
  route,
  bekannteEmails,
}: {
  kundeId: string;
  route: "content-strategie-mail" | "feedback-mail";
  bekannteEmails: { email: string; label: string }[];
}) {
  const t = useT();
  const [offen, setOffen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function senden(email: string) {
    if (!email.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch(`/api/admin/kunden/${kundenprofilId}/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) setTimeout(() => { setStatus("idle"); setOffen(false); setEmailInput(""); }, 2000);
    } catch {
      setStatus("error");
    }
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="text-xs px-3 py-1.5 rounded-lg bg-elevated border border-divider text-muted hover:text-fg transition-colors shrink-0"
      >
        {t.kundeDetailView.mailSenden}
      </button>
    );
  }

  return (
    <div className="mt-2 p-3 rounded-xl border border-divider bg-elevated space-y-2">
      {bekannteEmails.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {bekannteEmails.map(({ email, label }) => (
            <button
              key={email}
              onClick={() => setEmailInput(email)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${emailInput === email ? "border-accent bg-accent/10 text-accent" : "border-divider text-muted hover:text-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder={t.kundeDetailView.mailEmpfaenger}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-canvas border border-divider text-fg placeholder:text-subtle focus:outline-none focus:border-accent"
          onKeyDown={(e) => e.key === "Enter" && senden(emailInput)}
        />
        <button
          onClick={() => senden(emailInput)}
          disabled={status === "sending" || !emailInput.trim()}
          className="text-xs px-3 py-1.5 rounded-lg bg-accent text-white font-medium disabled:opacity-50 transition-colors hover:opacity-90 shrink-0"
        >
          {status === "sending" ? "…" : status === "sent" ? t.kundeDetailView.mailGesendet : status === "error" ? t.kundeDetailView.mailFehler : t.kundeDetailView.mailSendenBtn}
        </button>
        <button onClick={() => { setOffen(false); setEmailInput(""); setStatus("idle"); }} className="text-xs px-2 py-1.5 rounded-lg text-subtle hover:text-fg transition-colors">✕</button>
      </div>
    </div>
  );
}

function EinstellungenTab({
  kunde,
  alleKunden,
}: {
  kunde: KundeDetailProps["kunde"];
  alleKunden: AllesKundenprofil[];
}) {
  const t = useT();
  const [benutzerModalModus, setBenutzerModalModus] = useState<"bearbeiten" | null>(null);
  const [ausgewaehltUser, setAusgewaehltUser] = useState<KundeDetailProps["kunde"]["zugriffe"][number]["user"] | null>(null);
  const [kopiert, setKopiert] = useState<string | null>(null);

  function oeffneBenutzerBearbeiten(user: KundeDetailProps["kunde"]["zugriffe"][number]["user"]) {
    setAusgewaehltUser(user);
    setBenutzerModalModus("bearbeiten");
  }

  function copyLink(key: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setKopiert(key);
      setTimeout(() => setKopiert(null), 2000);
    });
  }

  const bekannteEmails = [
    kunde.emailAnsprechpartner ? { email: kunde.emailAnsprechpartner, label: kunde.ansprechpartner || kunde.emailAnsprechpartner } : null,
    kunde.emailFreigabeVerantwortlicher ? { email: kunde.emailFreigabeVerantwortlicher, label: kunde.freigabeVerantwortlicher || kunde.emailFreigabeVerantwortlicher } : null,
    kunde.emailFreigabeVerantwortlicher2 ? { email: kunde.emailFreigabeVerantwortlicher2, label: kunde.freigabeVerantwortlicher2 || kunde.emailFreigabeVerantwortlicher2 } : null,
  ].filter((e): e is { email: string; label: string } => e !== null);

  return (
    <div className="max-w-2xl space-y-4">
      <KlappSektion titel={t.kundeDetailView.startSeite}>
        <StartSeiteEditor kunde={kunde} />
      </KlappSektion>

      <KlappSektion titel={t.kundeDetailView.formulare}>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.kundeDetailView.contentStrategieFragebogen}</p>
                <p className="text-xs text-subtle mt-0.5 truncate">{t.kundeDetailView.stratHinweis}/{kunde.id}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copyLink("content-strategie", `${window.location.origin}/formular/content-strategie/${kunde.id}`)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-elevated border border-divider text-muted hover:text-fg transition-colors"
                >
                  {kopiert === "content-strategie" ? t.common.kopiert : t.common.kopieren}
                </button>
              </div>
            </div>
            <FormularMailSenden
              kundeId={kunde.id}
              route="content-strategie-mail"
              bekannteEmails={bekannteEmails}
            />
          </div>
          <div className="pt-3 border-t border-divider">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.kundeDetailView.kundenfeedbackFormular}</p>
                <p className="text-xs text-subtle mt-0.5 truncate">{t.kundeDetailView.feedbackHinweis}/{kunde.id}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => copyLink("feedback", `${window.location.origin}/formular/feedback/${kunde.id}`)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-elevated border border-divider text-muted hover:text-fg transition-colors"
                >
                  {kopiert === "feedback" ? t.common.kopiert : t.common.kopieren}
                </button>
              </div>
            </div>
            <FormularMailSenden
              kundeId={kunde.id}
              route="feedback-mail"
              bekannteEmails={bekannteEmails}
            />
          </div>
        </div>
      </KlappSektion>

      <KlappSektion titel={t.kundeDetailView.benutzerZugriff}>
        {kunde.zugriffe.length === 0 ? (
          <p className="text-subtle text-sm mb-4">{t.kundeDetailView.keinBenutzer}</p>
        ) : (
          <div className="space-y-1 mb-4">
            {kunde.zugriffe.map((z) => (
              <ZugriffZeile key={z.id} zugriff={z} onBearbeiten={() => oeffneBenutzerBearbeiten(z.user)} />
            ))}
          </div>
        )}
        <BenutzerSchnellForm kundenprofilId={kunde.id} onErfolg={() => {}} />
      </KlappSektion>

      <KlappSektion titel={t.kundeDetailView.datenschutz}>
        <DatenschutzTab kunde={kunde} />
      </KlappSektion>

      {benutzerModalModus === "bearbeiten" && ausgewaehltUser && (
        <BenutzerModal
          modus="bearbeiten"
          benutzer={{
            id: ausgewaehltUser.id,
            name: ausgewaehltUser.name,
            email: ausgewaehltUser.email,
            aktiv: ausgewaehltUser.aktiv,
            zugriffe: kunde.zugriffe
              .filter((z) => z.user.id === ausgewaehltUser.id)
              .map((z) => ({
                id: z.id,
                kundenprofil: { id: kunde.id, unternehmensname: kunde.unternehmensname },
              })),
          }}
          alleKunden={alleKunden}
          onClose={() => { setBenutzerModalModus(null); setAusgewaehltUser(null); }}
        />
      )}
    </div>
  );
}

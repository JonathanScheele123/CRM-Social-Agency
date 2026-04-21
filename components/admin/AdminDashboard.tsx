"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { useT } from "@/lib/i18n";

type KundenUebersicht = {
  id: string;
  kundenNr: number;
  unternehmensname: string | null;
  kundenKategorie: string | null;
  statusKunde: string | null;
  letzterKontakt: Date | null;
  vertraglicheFestgelegtePostAnzahl: number | null;
  angenommeneIdeen: number;
  _count: { contentIdeen_: number; kalender: number; zugriffe: number };
};

type FehlerLogEintrag = {
  id: string;
  createdAt: Date;
  fehlerCode: string | null;
  nachricht: string;
  kontext: string | null;
  url: string | null;
  benutzerTyp: string | null;
};

const KATEGORIE_FARBEN: Record<string, string> = {
  "A-Kunde":     "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  "B-Kunde":     "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
  "C-Kunde":     "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30",
  Bestandskunde: "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/30",
  Neukunde:      "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
  Potenzial:     "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30",
  Inaktiv:       "bg-gray-100 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/30",
};

function formatDatum(d: Date) {
  return new Date(d).toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function FehlerProtokoll({ logs: initialLogs }: { logs: FehlerLogEintrag[] }) {
  const t = useT();
  const [offen, setOffen] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [laden, setLaden] = useState(false);

  async function laden_() {
    setLaden(true);
    try {
      const res = await fetch("/api/fehlerlog");
      if (res.ok) {
        const d = await res.json();
        setLogs(d.logs ?? []);
      }
    } finally {
      setLaden(false);
    }
  }

  async function oeffnen() {
    const neu = !offen;
    setOffen(neu);
    if (neu) await laden_();
  }

  async function allesLoeschen() {
    if (!confirm(t.adminDashboard.alleLoeschenFrage)) return;
    await fetch("/api/fehlerlog", { method: "DELETE" });
    setLogs([]);
  }

  return (
    <div className="border-t border-divider pt-6">
      <button
        onClick={oeffnen}
        className="flex items-center gap-2 text-xs text-subtle hover:text-muted transition-colors"
      >
        <span className={`transition-transform duration-150 ${offen ? "rotate-90" : ""}`}>▶</span>
        {t.adminDashboard.fehlerprotokoll}
        {logs.length > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500/15 text-red-500 text-[10px] font-medium">
            {logs.length > 99 ? "99+" : logs.length}
          </span>
        )}
      </button>

      {offen && (
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-subtle">
              {laden ? t.common.laden : logs.length === 0 ? t.adminDashboard.keineEintraege : `${logs.length} ${t.adminDashboard.eintraege}`}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={laden_} className="text-xs text-subtle hover:text-fg transition-colors">
                {t.adminDashboard.aktualisieren}
              </button>
              {logs.length > 0 && (
                <button onClick={allesLoeschen} className="text-xs text-subtle hover:text-red-500 transition-colors">
                  {t.adminDashboard.alleLoeschen}
                </button>
              )}
            </div>
          </div>
          {logs.length > 0 && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-divider divide-y divide-divider">
              {logs.map(log => (
                <div key={log.id} className="px-3 py-2 text-xs grid grid-cols-[6rem_auto] gap-x-3 gap-y-0.5 hover:bg-elevated transition-colors">
                  <span className="text-subtle shrink-0">{formatDatum(log.createdAt)}</span>
                  <span className="text-fg truncate font-medium">{log.nachricht}</span>
                  {(log.fehlerCode || log.kontext || log.benutzerTyp) && (
                    <>
                      <span />
                      <span className="text-subtle">
                        {[log.fehlerCode, log.kontext, log.benutzerTyp].filter(Boolean).join(" · ")}
                      </span>
                    </>
                  )}
                  {log.url && (
                    <>
                      <span />
                      <span className="text-subtle truncate">{log.url}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type ContextMenuState = { x: number; y: number; kunde: KundenUebersicht };

function KundeContextMenu({
  state, onClose, onOeffnen, onBearbeiten, onLoeschen,
}: {
  state: ContextMenuState;
  onClose: () => void;
  onOeffnen: () => void;
  onBearbeiten: () => void;
  onLoeschen: () => void;
}) {
  const t = useT();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ position: "fixed", top: state.y, left: state.x, zIndex: 9999 }}
      className="bg-card border border-divider rounded-xl shadow-xl py-1 min-w-[180px] text-sm"
    >
      <button onClick={() => { onOeffnen(); onClose(); }}
        className="w-full text-left px-4 py-2 text-fg hover:bg-elevated transition-colors flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        {t.adminDashboard.interfaceOeffnen}
      </button>
      <button onClick={() => { onBearbeiten(); onClose(); }}
        className="w-full text-left px-4 py-2 text-fg hover:bg-elevated transition-colors flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        {t.adminDashboard.kundendatenBearbeiten}
      </button>
      <div className="my-1 border-t border-divider" />
      <button onClick={() => { onLoeschen(); onClose(); }}
        className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
        {t.common.loeschen}
      </button>
    </div>
  );
}

function LoeschDialog({ kunde, onAbbrechen, onBestaetigen, laden }: {
  kunde: KundenUebersicht; onAbbrechen: () => void; onBestaetigen: () => void; laden: boolean;
}) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-card border border-divider rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 className="font-semibold text-fg mb-1">{t.adminDashboard.interfaceLoeschenFrage}</h3>
        <p className="text-sm text-muted mb-5">
          <span className="font-medium text-fg">{kunde.unternehmensname ?? t.adminDashboard.unbenannt}</span>{" "}
          {t.adminDashboard.interfaceLoeschenText}
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onAbbrechen} className="px-4 py-2 rounded-lg text-sm text-muted hover:text-fg transition-colors">
            {t.common.abbrechen}
          </button>
          <button onClick={onBestaetigen} disabled={laden}
            className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50">
            {laden ? t.common.wirdGeloescht : t.common.endgueltigLoeschen}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ kunden, fehlerLogs }: { kunden: KundenUebersicht[]; fehlerLogs: FehlerLogEintrag[] }) {
  const t = useT();
  const router = useRouter();
  const [suche, setSuche] = useState("");
  const [kopiert, setKopiert] = useState<string | null>(null);
  const [kontextMenu, setKontextMenu] = useState<ContextMenuState | null>(null);
  const [loeschKandidat, setLoeschKandidat] = useState<KundenUebersicht | null>(null);
  const [loeschLaden, setLoeschLaden] = useState(false);
  const [lokalKunden, setLokalKunden] = useState(kunden);

  useEffect(() => { setLokalKunden(kunden); }, [kunden]);

  function handleContextMenu(e: React.MouseEvent, kunde: KundenUebersicht) {
    e.preventDefault();
    setKontextMenu({ x: e.clientX, y: e.clientY, kunde });
  }

  async function kundeLoeschen() {
    if (!loeschKandidat) return;
    setLoeschLaden(true);
    const res = await fetch(`/api/admin/kunden/${loeschKandidat.id}`, { method: "DELETE" });
    setLoeschLaden(false);
    if (res.ok) { setLokalKunden(prev => prev.filter(k => k.id !== loeschKandidat.id)); setLoeschKandidat(null); }
  }

  const gefilterteKunden = lokalKunden.filter(k =>
    (k.unternehmensname ?? "").toLowerCase().includes(suche.toLowerCase())
  );

  function copyLink(url: string, key: string) {
    navigator.clipboard.writeText(url).then(() => { setKopiert(key); setTimeout(() => setKopiert(null), 2000); });
  }

  function limitErreicht(k: KundenUebersicht) {
    return typeof k.vertraglicheFestgelegtePostAnzahl === "number" &&
      k.vertraglicheFestgelegtePostAnzahl > 0 &&
      k.angenommeneIdeen >= k.vertraglicheFestgelegtePostAnzahl;
  }

  return (
    <div className="min-h-screen text-fg">
      <header className="sticky top-0 z-10 border-b border-divider px-6 py-4 flex items-center justify-between glass-bar">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="JS Media" width={32} height={32} className="dark:hidden opacity-90" />
          <img src="/logo-white.png" alt="JS Media" width={32} height={32} className="hidden dark:block opacity-90" />
          <span className="text-subtle text-sm hidden sm:inline">{t.nav.admin}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/admin/kunden/neu")}
            className="bg-accent hover:bg-accent-hover text-white text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap">
            <span className="hidden sm:inline">{t.adminDashboard.neuKunde}</span>
            <span className="sm:hidden">+</span>
          </button>
          <button onClick={() => router.push("/admin/benutzer")}
            className="text-muted hover:text-fg text-sm px-3 py-2 rounded-lg hover:bg-elevated transition-colors">
            {t.nav.benutzer}
          </button>
          <button onClick={() => router.push("/admin/einstellungen")}
            className="text-muted hover:text-fg text-sm px-3 py-2 rounded-lg hover:bg-elevated transition-colors">
            {t.nav.einstellungen}
          </button>
          <LangToggle />
          <ThemeToggle />
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-muted hover:text-fg text-sm px-3 py-2 rounded-lg hover:bg-elevated transition-colors">
            {t.nav.abmelden}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        <div>
          <h2 className="text-base font-semibold text-fg mb-3">{t.nav.formulare}</h2>
          <div className="space-y-2">
            <div className="bg-card border border-divider rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.adminDashboard.neukunden}</p>
                <p className="text-xs text-subtle mt-0.5">/formular/onboarding</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2.5 py-1.5 rounded-lg bg-elevated border border-divider text-subtle font-mono select-all">
                  onboarding123
                </span>
                <button
                  onClick={() => copyLink(`${window.location.origin}/formular/onboarding`, "onboarding")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-elevated border border-divider text-muted hover:text-fg transition-colors">
                  {kopiert === "onboarding" ? t.common.kopiert : t.common.kopieren}
                </button>
              </div>
            </div>
            <div className="bg-card border border-divider rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.adminDashboard.contentStrategie}</p>
                <p className="text-xs text-subtle mt-0.5">{t.adminDashboard.stratHinweis}</p>
              </div>
            </div>
            <div className="bg-card border border-divider rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">{t.adminDashboard.kundenfeedback}</p>
                <p className="text-xs text-subtle mt-0.5">{t.adminDashboard.feedbackHinweis}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-fg">{t.adminDashboard.kundenInterfaces}</h2>
            <input
              type="text"
              value={suche}
              onChange={(e) => setSuche(e.target.value)}
              placeholder={t.adminDashboard.kundenSuchen}
              className="bg-elevated border border-divider text-fg text-sm rounded-xl px-3 py-2 placeholder:text-subtle focus:outline-none focus:border-accent w-56 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 btn-group flex-wrap">
            {gefilterteKunden.map((kunde) => (
              <button
                key={kunde.id}
                onClick={() => router.push(`/admin/kunden/${kunde.id}`)}
                onContextMenu={(e) => handleContextMenu(e, kunde)}
                className={`bg-card border rounded-2xl p-5 text-left transition-all hover:shadow-md group ${
                  limitErreicht(kunde)
                    ? "border-green-400/50 dark:border-green-500/40 shadow-[0_0_18px_rgba(34,197,94,0.12)] dark:shadow-[0_0_18px_rgba(34,197,94,0.18)]"
                    : kunde._count.zugriffe === 0
                    ? "border-red-400/50 dark:border-red-500/40 shadow-[0_0_18px_rgba(239,68,68,0.12)] dark:shadow-[0_0_18px_rgba(239,68,68,0.20)]"
                    : "border-divider hover:border-muted/40"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-subtle mb-1">#{kunde.kundenNr}</p>
                    <h3 className="font-semibold text-fg group-hover:text-accent transition-colors">
                      {kunde.unternehmensname ?? t.adminDashboard.unbenannt}
                    </h3>
                  </div>
                  {kunde.kundenKategorie && (
                    <span className={`text-xs px-2 py-1 rounded-lg border ${KATEGORIE_FARBEN[kunde.kundenKategorie] ?? "bg-elevated text-muted border-divider"}`}>
                      {kunde.kundenKategorie}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span>{kunde._count.contentIdeen_} {t.adminDashboard.ideen}</span>
                  <span>{kunde._count.kalender} {t.adminDashboard.imKalender}</span>
                  {limitErreicht(kunde) && (
                    <span className="text-green-500 text-xs font-medium ml-auto">{t.adminDashboard.limitErreicht}</span>
                  )}
                </div>
                {kunde.statusKunde && (
                  <p className="text-xs text-subtle mt-2 truncate">{kunde.statusKunde}</p>
                )}
              </button>
            ))}

            {kunden.length === 0 && (
              <button onClick={() => router.push("/admin/kunden/neu")}
                className="bg-card border border-red-400/50 dark:border-red-500/40 rounded-2xl p-5 text-left transition-all hover:shadow-md group shadow-[0_0_24px_rgba(239,68,68,0.15)] dark:shadow-[0_0_24px_rgba(239,68,68,0.22)] hover:shadow-[0_0_32px_rgba(239,68,68,0.25)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-subtle mb-1">#—</p>
                    <h3 className="font-semibold text-muted group-hover:text-fg transition-colors">{t.adminDashboard.keinKunde}</h3>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg border bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30">
                    {t.adminDashboard.ausstehend}
                  </span>
                </div>
                <p className="text-sm text-muted group-hover:text-accent transition-colors">{t.adminDashboard.erstKunde}</p>
              </button>
            )}
            {kunden.length > 0 && gefilterteKunden.length === 0 && (
              <div className="col-span-3 text-center py-12 text-subtle">{t.adminDashboard.keineKunden}</div>
            )}
          </div>
        </div>

        <FehlerProtokoll logs={fehlerLogs} />
      </main>

      {kontextMenu && (
        <KundeContextMenu
          state={kontextMenu}
          onClose={() => setKontextMenu(null)}
          onOeffnen={() => router.push(`/admin/kunden/${kontextMenu.kunde.id}`)}
          onBearbeiten={() => router.push(`/admin/kunden/${kontextMenu.kunde.id}/bearbeiten`)}
          onLoeschen={() => setLoeschKandidat(kontextMenu.kunde)}
        />
      )}
      {loeschKandidat && (
        <LoeschDialog
          kunde={loeschKandidat}
          onAbbrechen={() => setLoeschKandidat(null)}
          onBestaetigen={kundeLoeschen}
          laden={loeschLaden}
        />
      )}
    </div>
  );
}

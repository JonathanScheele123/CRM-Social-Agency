"use client";

import { useState, useEffect, useTransition } from "react";
import { useT, useLang } from "@/lib/i18n";

type KPIDatei = { id: string; name: string; url: string; typ: string; groesse: number | null };
type KPI = {
  id: string; monatJahr: string | null; plattform: string | null;
  reichweite: number | null; impressionen: number | null; follower: number | null;
  engagementRate: number | null; likes: number | null; kommentare: number | null;
  shares: number | null; saves: number | null; klicks: number | null;
  analyseKommentar: string | null; anomalieErkennung: string | null;
  dateien: KPIDatei[];
};
type SocialAccount = {
  id: string; plattform: string; accountId: string;
  accountName: string | null; accountHandle: string | null; syncedAt: string | null;
};

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: "📷", color: "from-purple-500 to-pink-500", connectsVia: "meta" },
  { key: "facebook",  label: "Facebook",  icon: "📘", color: "from-blue-600 to-blue-400",  connectsVia: "meta" },
  { key: "tiktok",    label: "TikTok",    icon: "🎵", color: "from-gray-800 to-gray-600",  connectsVia: "soon" },
  { key: "youtube",   label: "YouTube",   icon: "▶️",  color: "from-red-600 to-red-400",    connectsVia: "soon" },
];

function Sparkline({ values, color = "#a855f7" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80; const h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function zahl(val: number | null, locale: string) {
  if (val == null) return "–";
  return val.toLocaleString(locale);
}

function DateiBereich({ kpiId, dateien: init, isAdmin }: { kpiId: string; dateien: KPIDatei[]; isAdmin: boolean }) {
  const t = useT();
  const [dateien, setDateien] = useState(init);
  const [uploading, setUploading] = useState(false);
  const [deletePending, startDelete] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file); fd.append("kpiId", kpiId);
    const res = await fetch("/api/kpis/dateien", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) { const neu = await res.json(); setDateien(p => [...p, neu]); }
    if (e.target) e.target.value = "";
  }

  if (dateien.length === 0 && !isAdmin) return null;
  return (
    <div className="glass-modal rounded-2xl p-4 mt-3 shadow-sm">
      <p className="text-subtle text-xs font-medium uppercase tracking-wider mb-3">{t.kpiTab.material}</p>
      {dateien.length > 0 && (
        <div className="space-y-2 mb-3">
          {dateien.map(d => (
            <div key={d.id} className="flex items-center gap-3 bg-elevated rounded-xl px-3 py-2.5">
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-fg hover:text-accent truncate transition-colors">{d.name}</a>
              {isAdmin && (
                <button onClick={() => startDelete(async () => { const r = await fetch(`/api/kpis/dateien/${d.id}`, { method: "DELETE" }); if (r.ok) setDateien(p => p.filter(x => x.id !== d.id)); })} disabled={deletePending} className="text-subtle hover:text-red-500 text-xs shrink-0">✕</button>
              )}
            </div>
          ))}
        </div>
      )}
      {isAdmin && (
        <>
          <input type="file" accept="video/*,.pdf,.ppt,.pptx,.key" onChange={handleUpload} className="hidden" id={`upload-${kpiId}`} />
          <label htmlFor={`upload-${kpiId}`} className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-divider hover:border-accent/50 rounded-xl py-2.5 text-sm text-muted hover:text-accent cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            {uploading ? t.kpiTab.wirdHochgeladen : t.kpiTab.uploadBtn}
          </label>
        </>
      )}
    </div>
  );
}

export default function KPITab({ kpis, isAdmin = false, kundenprofilId, kpisFreigegeben: initFreigegeben = false }: {
  kpis: KPI[]; isAdmin?: boolean; kundenprofilId?: string; kpisFreigegeben?: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const locale = lang === "de" ? "de-DE" : "en-GB";

  const [freigegeben, setFreigegeben] = useState(initFreigegeben);
  const [togglePending, startToggle] = useTransition();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("alle");
  const [vergleich, setVergleich] = useState(false);

  useEffect(() => {
    if (!kundenprofilId || !isAdmin) return;
    fetch(`/api/social/${kundenprofilId}/accounts`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setSocialAccounts(d); })
      .catch(() => {});
  }, [kundenprofilId, isAdmin]);

  function handleToggle() {
    if (!kundenprofilId) return;
    const neu = !freigegeben;
    setFreigegeben(neu);
    startToggle(async () => {
      const res = await fetch("/api/kpis/sichtbarkeit", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kundenprofilId, kpisFreigegeben: neu }) });
      if (!res.ok) setFreigegeben(!neu);
    });
  }

  async function handleSync() {
    if (!kundenprofilId) return;
    setSyncing(true); setSyncMsg(null);
    const res = await fetch(`/api/social/${kundenprofilId}/sync`, { method: "POST" });
    const data = await res.json();
    const ok = (data.results ?? []).filter((r: { success: boolean }) => r.success).length;
    setSyncMsg(`${ok} Account${ok !== 1 ? "s" : ""} synchronisiert`);
    const updated = await fetch(`/api/social/${kundenprofilId}/accounts`).then(r => r.json());
    if (Array.isArray(updated)) setSocialAccounts(updated);
    setSyncing(false);
  }

  // Build filter options from connected accounts
  const connectedByPlatform = (plattform: string) =>
    socialAccounts.filter(a => a.plattform === plattform);

  // Filter KPIs
  const filteredKpis = selectedFilter === "alle"
    ? kpis
    : kpis.filter(k => k.plattform?.toLowerCase().includes(selectedFilter.toLowerCase()));

  // For comparison: group latest KPI per plattform
  const latestPerPlatform = Array.from(
    kpis.reduce((map, kpi) => {
      const pl = kpi.plattform ?? "Manuell";
      if (!map.has(pl)) map.set(pl, kpi);
      return map;
    }, new Map<string, KPI>())
  );

  // For sparkline: last 3 follower values per platform
  const sparklineData = (plattform: string) =>
    kpis.filter(k => k.plattform === plattform && k.follower != null)
      .slice(0, 6).reverse().map(k => k.follower!);

  const [ausgewaehlt, setAusgewaehlt] = useState<KPI | null>(filteredKpis[0] ?? null);
  useEffect(() => { setAusgewaehlt(filteredKpis[0] ?? null); }, [selectedFilter]);

  return (
    <div className="space-y-5">

      {/* Freigabe Toggle */}
      {isAdmin && kundenprofilId && (
        <div className="flex items-center justify-between px-4 py-3 bg-card border border-divider rounded-2xl">
          <div>
            <p className="text-sm font-medium text-fg">{t.kpiTab.kpiSichtbar}</p>
            <p className="text-xs text-muted mt-0.5">{freigegeben ? t.kpiTab.kundenSehen : t.kpiTab.kpiAusgeblendet}</p>
          </div>
          <button onClick={handleToggle} disabled={togglePending} className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${freigegeben ? "bg-accent" : "bg-divider"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${freigegeben ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      )}

      {/* Platform Connection Row */}
      {isAdmin && kundenprofilId && (
        <div className="bg-card border border-divider rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Verbundene Accounts</p>
            {socialAccounts.length > 0 && (
              <button onClick={handleSync} disabled={syncing} className="text-xs text-accent hover:underline disabled:opacity-50">
                {syncing ? "Sync läuft…" : "↺ Synchronisieren"}
              </button>
            )}
          </div>
          {syncMsg && <p className="text-xs text-green-600 dark:text-green-400 mb-3">{syncMsg}</p>}
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => {
              const connected = connectedByPlatform(p.key);
              const isSoon = p.connectsVia === "soon";
              return (
                <div key={p.key}>
                  {connected.length > 0 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-elevated border border-divider rounded-xl">
                      <span className="text-sm">{p.icon}</span>
                      <div>
                        {connected.map(a => (
                          <span key={a.id} className="text-xs font-medium text-fg block leading-tight">
                            {a.accountHandle ? `@${a.accountHandle}` : (a.accountName ?? p.label)}
                          </span>
                        ))}
                      </div>
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 ml-1" />
                    </div>
                  ) : isSoon ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-divider rounded-xl opacity-50 cursor-not-allowed" title="Demnächst verfügbar">
                      <span className="text-sm">{p.icon}</span>
                      <span className="text-xs text-muted">{p.label}</span>
                      <span className="text-xs text-subtle">bald</span>
                    </div>
                  ) : (
                    <a href={`/api/social/meta/connect?kundenprofilId=${kundenprofilId}`} className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-accent/40 hover:border-accent rounded-xl transition-colors group">
                      <span className="text-sm">{p.icon}</span>
                      <span className="text-xs text-muted group-hover:text-accent transition-colors">{p.label} verbinden</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {kpis.length === 0 ? (
        <div className="text-center py-12 text-subtle">{t.kpiTab.keineDaten}</div>
      ) : (
        <>
          {/* Filter + Vergleich Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setSelectedFilter("alle"); setVergleich(false); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${selectedFilter === "alle" && !vergleich ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"}`}
              >
                Alle
              </button>
              {Array.from(new Set(kpis.map(k => k.plattform).filter(Boolean))).map(pl => (
                <button
                  key={pl}
                  onClick={() => { setSelectedFilter(pl!); setVergleich(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${selectedFilter === pl && !vergleich ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"}`}
                >
                  {pl}
                </button>
              ))}
            </div>
            {latestPerPlatform.length > 1 && (
              <button
                onClick={() => setVergleich(v => !v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${vergleich ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"}`}
              >
                ⇄ Vergleichen
              </button>
            )}
          </div>

          {/* Vergleichsansicht */}
          {vergleich ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestPerPlatform.map(([pl, kpi]) => (
                <div key={pl} className="glass-modal rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-fg truncate">{pl}</p>
                    <Sparkline values={sparklineData(pl)} />
                  </div>
                  <p className="text-xs text-muted">{kpi.monatJahr}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: "Follower",    v: kpi.follower },
                      { l: "Reichweite",  v: kpi.reichweite },
                      { l: "Impressionen",v: kpi.impressionen },
                      { l: "Engagement",  v: kpi.engagementRate ? `${kpi.engagementRate}%` : null },
                      { l: "Likes",       v: kpi.likes },
                      { l: "Kommentare",  v: kpi.kommentare },
                    ].map(item => (
                      <div key={item.l} className="bg-elevated rounded-xl p-2.5">
                        <p className="text-xs text-muted mb-0.5">{item.l}</p>
                        <p className="text-sm font-semibold text-fg">{typeof item.v === "string" ? item.v : zahl(item.v as number | null, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Einzel-Ansicht */
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Monats-Liste */}
              <div className="w-full lg:w-64 shrink-0">
                <p className="text-subtle text-xs font-medium mb-2 uppercase tracking-wider">{t.kpiTab.berichte}</p>
                <div className="space-y-1">
                  {filteredKpis.map(kpi => (
                    <button
                      key={kpi.id}
                      onClick={() => setAusgewaehlt(kpi)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${ausgewaehlt?.id === kpi.id ? "bg-accent/10 dark:bg-accent/20 text-accent border border-accent/20" : "text-fg hover:bg-elevated"}`}
                    >
                      <p className="font-medium">{kpi.monatJahr ?? "–"}</p>
                      {kpi.plattform && <p className="text-xs text-muted truncate">{kpi.plattform}</p>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail */}
              {ausgewaehlt && (
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                      <h2 className="font-semibold text-lg text-fg">{ausgewaehlt.monatJahr}</h2>
                      {ausgewaehlt.plattform && <p className="text-muted text-sm">{ausgewaehlt.plattform}</p>}
                    </div>
                    {sparklineData(ausgewaehlt.plattform ?? "").length >= 2 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-elevated rounded-xl">
                        <span className="text-xs text-muted">Follower-Verlauf</span>
                        <Sparkline values={sparklineData(ausgewaehlt.plattform ?? "")} color="#a855f7" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[
                      { label: t.kpiTab.reichweite,     wert: ausgewaehlt.reichweite },
                      { label: t.kpiTab.impressionen,   wert: ausgewaehlt.impressionen },
                      { label: t.kpiTab.follower,       wert: ausgewaehlt.follower },
                      { label: t.kpiTab.engagementRate, wert: ausgewaehlt.engagementRate ? `${ausgewaehlt.engagementRate}%` : null },
                      { label: t.kpiTab.likes,          wert: ausgewaehlt.likes },
                      { label: t.kpiTab.kommentare,     wert: ausgewaehlt.kommentare },
                      { label: t.kpiTab.shares,         wert: ausgewaehlt.shares },
                      { label: t.kpiTab.saves,          wert: ausgewaehlt.saves },
                      { label: t.kpiTab.klicks,         wert: ausgewaehlt.klicks },
                    ].map(item => (
                      <div key={item.label} className="glass-modal rounded-2xl p-4 shadow-sm">
                        <p className="text-muted text-xs mb-1">{item.label}</p>
                        <p className="text-xl font-semibold text-fg">
                          {typeof item.wert === "string" ? item.wert : zahl(item.wert as number | null, locale)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {ausgewaehlt.analyseKommentar && (
                    <div className="glass-modal rounded-2xl p-4 mb-3 shadow-sm">
                      <p className="text-subtle text-xs font-medium uppercase tracking-wider mb-2">{t.kpiTab.analyse}</p>
                      <p className="text-sm text-fg">{ausgewaehlt.analyseKommentar}</p>
                    </div>
                  )}
                  {ausgewaehlt.anomalieErkennung && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-600/30 rounded-2xl p-4 mb-3">
                      <p className="text-yellow-700 dark:text-yellow-400 text-xs font-medium uppercase tracking-wider mb-2">{t.kpiTab.anomalie}</p>
                      <p className="text-sm text-fg">{ausgewaehlt.anomalieErkennung}</p>
                    </div>
                  )}

                  <DateiBereich kpiId={ausgewaehlt.id} dateien={ausgewaehlt.dateien} isAdmin={isAdmin} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

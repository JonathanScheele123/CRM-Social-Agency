"use client";

import { useState, useRef, useTransition } from "react";
import { useT, useLang } from "@/lib/i18n";

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

function zahl(val: number | null, locale: string): string {
  if (val == null) return "–";
  return val.toLocaleString(locale);
}

function dateiGroesse(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return ` · ${(bytes / 1024).toFixed(0)} KB`;
  return ` · ${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DateiSymbol({ typ }: { typ: string }) {
  if (typ === "video") return <span className="text-blue-500">▶</span>;
  if (typ === "pdf") return <span className="text-red-500">PDF</span>;
  if (typ === "presentation") return <span className="text-orange-500">▤</span>;
  return <span className="text-muted">↗</span>;
}

function DateiBereich({
  kpiId,
  dateien: initialDateien,
  isAdmin,
}: {
  kpiId: string;
  dateien: KPIDatei[];
  isAdmin: boolean;
}) {
  const t = useT();
  const [dateien, setDateien] = useState(initialDateien);
  const [uploading, setUploading] = useState(false);
  const [fehler, setFehler] = useState("");
  const [deletePending, startDelete] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFehler("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kpiId", kpiId);
    const res = await fetch("/api/kpis/dateien", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) { setFehler(t.kpiTab.uploadFehler); return; }
    const neu: KPIDatei = await res.json();
    setDateien(prev => [...prev, neu]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      const res = await fetch(`/api/kpis/dateien/${id}`, { method: "DELETE" });
      if (res.ok) setDateien(prev => prev.filter(d => d.id !== id));
    });
  }

  if (dateien.length === 0 && !isAdmin) return null;

  return (
    <div className="glass-modal rounded-2xl p-4 mt-3 shadow-sm">
      <p className="text-subtle text-xs font-medium uppercase tracking-wider mb-3">{t.kpiTab.material}</p>

      {dateien.length > 0 && (
        <div className="space-y-2 mb-3">
          {dateien.map(d => (
            <div key={d.id} className="flex items-center gap-3 bg-elevated rounded-xl px-3 py-2.5">
              <span className="text-xs font-mono w-8 text-center shrink-0">
                <DateiSymbol typ={d.typ} />
              </span>
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-fg hover:text-accent truncate transition-colors"
              >
                {d.name}
                <span className="text-subtle text-xs">{dateiGroesse(d.groesse)}</span>
              </a>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(d.id)}
                  disabled={deletePending}
                  className="text-subtle hover:text-red-500 transition-colors text-xs shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="video/*,.pdf,.ppt,.pptx,.key"
            onChange={handleUpload}
            className="hidden"
            id={`upload-${kpiId}`}
          />
          <label
            htmlFor={`upload-${kpiId}`}
            className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-divider hover:border-accent/50 rounded-xl py-2.5 text-sm text-muted hover:text-accent cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? t.kpiTab.wirdHochgeladen : t.kpiTab.uploadBtn}
          </label>
          {fehler && <p className="text-red-500 text-xs mt-1">{fehler}</p>}
        </>
      )}
    </div>
  );
}

export default function KPITab({
  kpis,
  isAdmin = false,
  kundenprofilId,
  kpisFreigegeben: initialFreigegeben = false,
}: {
  kpis: KPI[];
  isAdmin?: boolean;
  kundenprofilId?: string;
  kpisFreigegeben?: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [ausgewaehlt, setAusgewaehlt] = useState<KPI | null>(kpis[0] ?? null);
  const [freigegeben, setFreigegeben] = useState(initialFreigegeben);
  const [togglePending, startToggle] = useTransition();

  function handleToggle() {
    if (!kundenprofilId) return;
    const neu = !freigegeben;
    setFreigegeben(neu);
    startToggle(async () => {
      const res = await fetch("/api/kpis/sichtbarkeit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kundenprofilId, kpisFreigegeben: neu }),
      });
      if (!res.ok) setFreigegeben(!neu);
    });
  }

  return (
    <div>
      {isAdmin && kundenprofilId && (
        <div className="flex items-center justify-between mb-5 px-4 py-3 bg-card border border-divider rounded-2xl">
          <div>
            <p className="text-sm font-medium text-fg">{t.kpiTab.kpiSichtbar}</p>
            <p className="text-xs text-muted mt-0.5">
              {freigegeben ? t.kpiTab.kundenSehen : t.kpiTab.kpiAusgeblendet}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={togglePending}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
              freigegeben ? "bg-accent" : "bg-divider"
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              freigegeben ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
        </div>
      )}

      {kpis.length === 0 ? (
        <div className="text-center py-12 text-subtle">{t.kpiTab.keineDaten}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-64 shrink-0">
            <p className="text-subtle text-xs font-medium mb-2 uppercase tracking-wider">{t.kpiTab.berichte}</p>
            <div className="space-y-1">
              {kpis.map((kpi) => (
                <button
                  key={kpi.id}
                  onClick={() => setAusgewaehlt(kpi)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    ausgewaehlt?.id === kpi.id
                      ? "bg-accent/10 dark:bg-accent/20 text-accent border border-accent/20"
                      : "text-fg hover:bg-elevated"
                  }`}
                >
                  <p className="font-medium">{kpi.monatJahr ?? "–"}</p>
                  {kpi.plattform && <p className="text-xs text-muted">{kpi.plattform}</p>}
                </button>
              ))}
            </div>
          </div>

          {ausgewaehlt && (
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className="font-semibold text-lg text-fg">{ausgewaehlt.monatJahr}</h2>
                  {ausgewaehlt.plattform && (
                    <p className="text-muted text-sm">{ausgewaehlt.plattform}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { label: t.kpiTab.reichweite,      wert: ausgewaehlt.reichweite },
                  { label: t.kpiTab.impressionen,    wert: ausgewaehlt.impressionen },
                  { label: t.kpiTab.follower,        wert: ausgewaehlt.follower },
                  { label: t.kpiTab.engagementRate,  wert: ausgewaehlt.engagementRate ? `${ausgewaehlt.engagementRate}%` : null },
                  { label: t.kpiTab.likes,           wert: ausgewaehlt.likes },
                  { label: t.kpiTab.kommentare,      wert: ausgewaehlt.kommentare },
                  { label: t.kpiTab.shares,          wert: ausgewaehlt.shares },
                  { label: t.kpiTab.saves,           wert: ausgewaehlt.saves },
                  { label: t.kpiTab.klicks,          wert: ausgewaehlt.klicks },
                ].map((item) => (
                  <div key={item.label} className="glass-modal rounded-2xl p-4 shadow-sm">
                    <p className="text-muted text-xs mb-1">{item.label}</p>
                    <p className="text-xl font-semibold text-fg">
                      {typeof item.wert === "string" ? item.wert : zahl(item.wert as number | null, dateLocale)}
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

              <DateiBereich
                kpiId={ausgewaehlt.id}
                dateien={ausgewaehlt.dateien}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

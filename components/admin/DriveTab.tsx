"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import DateizugriffVorschau from "@/components/shared/DateizugriffVorschau";
import { useT, useLang } from "@/lib/i18n";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
};

type BreadcrumbItem = { id: string; name: string };

function extractFolderId(url: string): string | null {
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function formatGroesse(bytes?: string): string {
  if (!bytes) return "";
  const n = parseInt(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDatum(iso?: string, locale = "de-DE"): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
          {label}
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700 mx-auto" />
      </div>
    </div>
  );
}

function OrdnerIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="0" y="5" width="32" height="23" rx="3.5" fill="#F59E0B" opacity="0.9" />
      <rect x="0" y="8" width="32" height="20" rx="3.5" fill="#FBBF24" />
      <rect x="0" y="5" width="13" height="5" rx="2.5" fill="#F59E0B" opacity="0.9" />
    </svg>
  );
}

function DateiIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/vnd.google-apps.folder") {
    return <OrdnerIcon size={22} />;
  }
  if (mimeType.startsWith("video/")) return <span className="text-purple-400 text-lg">🎬</span>;
  if (mimeType.startsWith("image/")) return <span className="text-blue-400 text-lg">🖼</span>;
  if (mimeType === "application/pdf") return <span className="text-red-400 text-lg">📄</span>;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <span className="text-green-500 text-lg">📊</span>;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return <span className="text-orange-400 text-lg">📑</span>;
  if (mimeType.includes("document") || mimeType.includes("word")) return <span className="text-blue-500 text-lg">📝</span>;
  if (mimeType.startsWith("audio/")) return <span className="text-pink-400 text-lg">🎵</span>;
  if (mimeType.includes("zip") || mimeType.includes("archive")) return <span className="text-gray-400 text-lg">📦</span>;
  return <span className="text-subtle text-lg">📎</span>;
}

function istMedienDatei(mimeType: string) {
  return mimeType.startsWith("image/") || mimeType.startsWith("video/") || mimeType === "application/pdf";
}

function ThumbnailBild({ fileId, mimeType, name }: { fileId: string; mimeType: string; name: string }) {
  const [fehler, setFehler] = useState(false);
  if (fehler) return <DateiIcon mimeType={mimeType} />;
  return (
    <img
      src={`/api/admin/drive/thumbnail?fileId=${fileId}`}
      alt={name}
      loading="lazy"
      className="w-full h-full object-cover"
      onError={() => setFehler(true)}
    />
  );
}

export default function DriveTab({ cloudLink }: { cloudLink: string | null }) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const rootFolderId = cloudLink ? extractFolderId(cloudLink) : null;

  const [pfad, setPfad] = useState<BreadcrumbItem[]>(() =>
    rootFolderId ? [{ id: rootFolderId, name: "root" }] : []
  );

  useEffect(() => {
    if (rootFolderId) setPfad([{ id: rootFolderId, name: "root" }]);
  }, [rootFolderId]);
  const [dateien, setDateien] = useState<DriveFile[]>([]);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [hochladen, setHochladen] = useState(false);
  const [fortschritt, setFortschritt] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState(false);
  const [loeschenId, setLoeschenId] = useState<string | null>(null);
  const [vorschau, setVorschau] = useState<DriveFile | null>(null);
  const [teilenId, setTeilenId] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState<string | null>(null);
  const [rasterAnsicht, setRasterAnsicht] = useState(false);
  const [neuerOrdnerModus, setNeuerOrdnerModus] = useState(false);
  const [neuerOrdnerName, setNeuerOrdnerName] = useState("");
  const [ordnerErstellen, setOrdnerErstellen] = useState(false);
  const [verschiebenId, setVerschiebenId] = useState<string | null>(null);
  const [dragOverOrdner, setDragOverOrdner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aktuellerOrdner = pfad[pfad.length - 1];

  const ladeDateien = useCallback(async (folderId: string) => {
    setLaden(true);
    setFehler("");
    try {
      const res = await fetch(`/api/admin/drive?folderId=${folderId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler ?? t.driveTab.fehlerLaden);
      setDateien(data.files ?? []);
    } catch (err) {
      setFehler(err instanceof Error ? err.message : t.driveTab.fehlerLaden);
    } finally {
      setLaden(false);
    }
  }, []);

  useEffect(() => {
    if (aktuellerOrdner) ladeDateien(aktuellerOrdner.id);
  }, [aktuellerOrdner, ladeDateien]);

  function ordnerOeffnen(id: string, name: string) {
    setPfad(prev => [...prev, { id, name }]);
  }

  function breadcrumbNavigieren(index: number) {
    setPfad(prev => prev.slice(0, index + 1));
  }

  async function dateiHochladen(files: FileList | File[]) {
    if (!aktuellerOrdner) return;
    const fileArr = Array.from(files);
    setHochladen(true);

    for (const file of fileArr) {
      const formData = new FormData();
      formData.append("file", file);

      setFortschritt(prev => ({ ...prev, [file.name]: 0 }));

      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", e => {
            if (e.lengthComputable) {
              setFortschritt(prev => ({ ...prev, [file.name]: Math.round((e.loaded / e.total) * 100) }));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`HTTP ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error(t.common.netzwerkFehler)));
          xhr.open("POST", `/api/admin/drive?folderId=${aktuellerOrdner.id}`);
          xhr.send(formData);
        });
      } catch {
        setFehler(`${t.driveTab.fehlerHochladen} "${file.name}".`);
      } finally {
        setFortschritt(prev => { const n = { ...prev }; delete n[file.name]; return n; });
      }
    }

    setHochladen(false);
    ladeDateien(aktuellerOrdner.id);
  }

  async function dateiLoeschen(fileId: string) {
    setLoeschenId(fileId);
    try {
      await fetch(`/api/admin/drive?fileId=${fileId}`, { method: "DELETE" });
      setDateien(prev => prev.filter(f => f.id !== fileId));
    } catch {
      setFehler(t.driveTab.fehlerLoeschen);
    } finally {
      setLoeschenId(null);
    }
  }

  async function linkTeilen(fileId: string) {
    setTeilenId(fileId);
    try {
      const res = await fetch(`/api/admin/drive/share?fileId=${fileId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setFehler(data.fehler ?? t.driveTab.fehlerLink); return; }
      await navigator.clipboard.writeText(data.link);
      setKopiert(fileId);
      setTimeout(() => setKopiert(null), 2000);
    } catch {
      setFehler(t.driveTab.fehlerLinkKopieren);
    } finally {
      setTeilenId(null);
    }
  }

  async function ordnerAnlegen() {
    if (!neuerOrdnerName.trim() || !aktuellerOrdner) return;
    setOrdnerErstellen(true);
    setFehler("");
    try {
      const res = await fetch(`/api/admin/drive?folderId=${aktuellerOrdner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: neuerOrdnerName.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDateien(prev => [data.file, ...prev]);
      setNeuerOrdnerName("");
      setNeuerOrdnerModus(false);
    } catch {
      setFehler(t.driveTab.fehlerOrdner);
    } finally {
      setOrdnerErstellen(false);
    }
  }

  async function dateiVerschieben(fileId: string, targetFolderId: string) {
    setFehler("");
    try {
      const res = await fetch(`/api/admin/drive?fileId=${fileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetFolderId, sourceFolderId: aktuellerOrdner?.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.fehler ?? `HTTP ${res.status}`);
      }
      setDateien(prev => prev.filter(f => f.id !== fileId));
      setVerschiebenId(null);
    } catch (err) {
      setFehler(`${t.driveTab.fehlerVerschieben}: ${err instanceof Error ? err.message : t.driveTab.unbekanntFehler}`);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) dateiHochladen(e.dataTransfer.files);
  }

  function onDropInOrdner(e: React.DragEvent, targetFolderId: string) {
    e.preventDefault();
    e.stopPropagation();
    setDragOverOrdner(null);
    const fileId = e.dataTransfer.getData("drive-file-id");
    if (fileId) dateiVerschieben(fileId, targetFolderId);
  }

  if (!rootFolderId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-subtle text-sm">{t.driveTab.keinLink}</p>
        <p className="text-subtle text-xs">{t.driveTab.linkHinweis}</p>
      </div>
    );
  }

  const ordner = dateien.filter(f => f.mimeType === "application/vnd.google-apps.folder");
  const files = dateien.filter(f => f.mimeType !== "application/vnd.google-apps.folder");
  const hochladenAktiv = Object.keys(fortschritt).length > 0;

  return (
    <div
      className={`rounded-2xl border transition-colors ${dragOver ? "border-accent bg-accent/5" : "border-divider"}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-divider">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm overflow-x-auto min-w-0">
          {pfad.map((item, i) => (
            <span key={item.id} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-subtle">/</span>}
              <button
                onClick={() => breadcrumbNavigieren(i)}
                className={`hover:text-accent transition-colors truncate max-w-[140px] ${
                  i === pfad.length - 1 ? "text-fg font-medium" : "text-muted"
                }`}
              >
                {i === 0 ? t.driveTab.projektordner : item.name}
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cloudLink && (
            <a
              href={cloudLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted hover:text-accent border border-divider hover:border-accent px-2.5 py-1.5 rounded-lg transition-colors"
            >
              ↗ Drive
            </a>
          )}
          <Tooltip label={rasterAnsicht ? t.driveTab.listenansicht : t.driveTab.rasteransicht}>
          <button
            onClick={() => setRasterAnsicht(v => !v)}
            className={`text-xs border px-2.5 py-1.5 rounded-lg transition-colors ${
              rasterAnsicht ? "bg-accent text-white border-accent" : "border-divider text-muted hover:text-fg"
            }`}
          >
            {rasterAnsicht ? "⊞" : "≡"}
          </button>
          </Tooltip>
          <button
            onClick={() => { setNeuerOrdnerModus(v => !v); setNeuerOrdnerName(""); }}
            className="text-xs border border-divider text-muted hover:text-fg px-2.5 py-1.5 rounded-lg transition-colors"
          >
            {t.driveTab.neuerOrdner}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={hochladen}
            className="flex items-center gap-1.5 text-xs bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            {hochladen ? t.driveTab.wirdHochgeladen : t.driveTab.hochladen}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => e.target.files && dateiHochladen(e.target.files)}
          />
        </div>
      </div>

      {/* Upload-Fortschritt */}
      {hochladenAktiv && (
        <div className="px-4 py-3 border-b border-divider space-y-2">
          {Object.entries(fortschritt).map(([name, pct]) => (
            <div key={name}>
              <div className="flex items-center justify-between text-xs text-muted mb-1">
                <span className="truncate max-w-[200px]">{name}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Neuer Ordner */}
      {neuerOrdnerModus && (
        <div className="px-4 py-3 border-b border-divider flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={neuerOrdnerName}
            onChange={e => setNeuerOrdnerName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") ordnerAnlegen(); if (e.key === "Escape") setNeuerOrdnerModus(false); }}
            placeholder={t.driveTab.ordnerName}
            className="flex-1 bg-elevated border border-divider text-fg rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={ordnerAnlegen}
            disabled={ordnerErstellen || !neuerOrdnerName.trim()}
            className="text-xs bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {ordnerErstellen ? "..." : t.common.erstellen}
          </button>
          <button onClick={() => setNeuerOrdnerModus(false)} className="text-xs text-muted hover:text-fg px-2 py-1.5 rounded-lg transition-colors">
            {t.common.abbrechen}
          </button>
        </div>
      )}

      {/* Drag-over-Hinweis */}
      {dragOver && (
        <div className="px-4 py-6 text-center text-accent text-sm font-medium border-b border-accent/30">
          {t.driveTab.dropZone}
        </div>
      )}

      {/* Fehler */}
      {fehler && (
        <div className="px-4 py-2 text-xs text-red-500 border-b border-divider">{fehler}</div>
      )}

      {/* Dateiliste */}
      <div className="divide-y divide-divider">
        {/* Zurück-Button */}
        {pfad.length > 1 && (
          <button
            onClick={() => setPfad(prev => prev.slice(0, -1))}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-elevated transition-colors text-left"
          >
            <span className="text-base">↩</span>
            <span>{t.driveTab.zurueck}</span>
          </button>
        )}

        {laden ? (
          <div className="px-4 py-10 text-center text-subtle text-sm">{t.driveTab.laden}</div>
        ) : dateien.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-subtle text-sm">{t.driveTab.leerOrdner}</p>
            <p className="text-subtle text-xs mt-1">{t.driveTab.hochladenHinweis}</p>
          </div>
        ) : (
          <>
            {rasterAnsicht ? (
              /* ── Raster-Ansicht ── */
              <div className="p-4 space-y-4">
                {ordner.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {ordner.map(f => (
                      <div
                        key={f.id}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverOrdner(f.id); }}
                        onDragLeave={() => setDragOverOrdner(null)}
                        onDrop={e => onDropInOrdner(e, f.id)}
                        className={`transition-all rounded-xl ${dragOverOrdner === f.id ? "ring-2 ring-accent/50 scale-[1.03]" : ""}`}
                      >
                        <button
                          onClick={() => ordnerOeffnen(f.id, f.name)}
                          className="w-full flex flex-col items-center gap-2 p-3 rounded-xl border border-divider hover:border-amber-300/60 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 transition-all text-center group"
                        >
                          <OrdnerIcon size={48} />
                          <span className="text-xs text-fg truncate w-full group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{f.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {files.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {files.map(f => (
                      <div key={f.id} className="group rounded-xl border border-divider overflow-hidden hover:border-accent/40 transition-all">
                        <button
                          onClick={() => setVorschau(vorschau?.id === f.id ? null : f)}
                          className="block w-full aspect-square bg-elevated overflow-hidden relative"
                        >
                          {istMedienDatei(f.mimeType) ? (
                            <ThumbnailBild fileId={f.id} mimeType={f.mimeType} name={f.name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-4xl"><DateiIcon mimeType={f.mimeType} /></span>
                            </div>
                          )}
                          {f.mimeType.startsWith("video/") && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                                <span className="text-white text-xs">▶</span>
                              </div>
                            </div>
                          )}
                        </button>
                        <div className="px-2 py-1.5 flex items-center justify-between gap-1">
                          <span className="text-xs text-fg truncate flex-1">{f.name}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Tooltip label={kopiert === f.id ? t.driveTab.kopiert : t.driveTab.linkKopieren}>
                            <button
                              onClick={() => linkTeilen(f.id)}
                              disabled={teilenId === f.id}
                              className={`text-xs transition-colors disabled:opacity-50 ${kopiert === f.id ? "text-green-500" : "text-muted hover:text-fg"}`}
                            >
                              {kopiert === f.id ? "✓" : teilenId === f.id ? "..." : "⎘"}
                            </button>
                            </Tooltip>
                            {f.webViewLink && (
                              <Tooltip label={t.driveTab.inDriveOeffnen}>
                              <a href={f.webViewLink} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-accent hover:underline">↗</a>
                              </Tooltip>
                            )}
                            <Tooltip label={t.driveTab.loeschen}>
                            <button onClick={() => dateiLoeschen(f.id)} disabled={loeschenId === f.id}
                              className="text-xs text-muted hover:text-red-500 transition-colors disabled:opacity-50">
                              {loeschenId === f.id ? "..." : "✕"}
                            </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ── Listen-Ansicht ── */
              <>
                {ordner.map(f => (
                  <div
                    key={f.id}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverOrdner(f.id); }}
                    onDragLeave={() => setDragOverOrdner(null)}
                    onDrop={e => onDropInOrdner(e, f.id)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors group ${
                      dragOverOrdner === f.id ? "bg-accent/10 ring-1 ring-inset ring-accent/30" : "hover:bg-elevated"
                    }`}
                  >
                    <button onClick={() => ordnerOeffnen(f.id, f.name)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <DateiIcon mimeType={f.mimeType} />
                      <span className="flex-1 text-sm text-fg truncate group-hover:text-accent transition-colors">{f.name}</span>
                      <span className="text-subtle text-xs">{formatDatum(f.modifiedTime, dateLocale)}</span>
                      <span className="text-subtle text-sm ml-1">›</span>
                    </button>
                  </div>
                ))}
                {files.map(f => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={e => e.dataTransfer.setData("drive-file-id", f.id)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors group cursor-grab active:cursor-grabbing"
                  >
                    <button onClick={() => setVorschau(vorschau?.id === f.id ? null : f)} className="shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-elevated flex items-center justify-center">
                      {istMedienDatei(f.mimeType) ? (
                        <ThumbnailBild fileId={f.id} mimeType={f.mimeType} name={f.name} />
                      ) : (
                        <DateiIcon mimeType={f.mimeType} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setVorschau(vorschau?.id === f.id ? null : f)}
                        className="text-sm text-fg truncate block text-left hover:text-accent transition-colors w-full"
                      >
                        {f.name}
                      </button>
                      <p className="text-xs text-subtle">{formatGroesse(f.size)}{f.size && f.modifiedTime ? " · " : ""}{formatDatum(f.modifiedTime, dateLocale)}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {ordner.length > 0 && (
                        <div className="relative">
                          <Tooltip label={t.driveTab.verschieben}>
                          <button
                            onClick={() => setVerschiebenId(verschiebenId === f.id ? null : f.id)}
                            className="text-xs text-muted hover:text-fg border border-divider px-2 py-1 rounded-lg transition-colors"
                          >
                            →
                          </button>
                          </Tooltip>
                          {verschiebenId === f.id && (
                            <div className="absolute right-0 top-7 z-20 bg-card border border-divider rounded-xl shadow-lg py-1 min-w-[160px]">
                              <p className="text-xs text-subtle px-3 py-1.5 border-b border-divider">{t.driveTab.verschiebenNach}</p>
                              {ordner.map(o => (
                                <button
                                  key={o.id}
                                  onClick={() => dateiVerschieben(f.id, o.id)}
                                  className="w-full text-left text-xs text-fg hover:bg-elevated px-3 py-2 transition-colors flex items-center gap-2"
                                >
                                  <OrdnerIcon size={16} />{o.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <Tooltip label={kopiert === f.id ? t.driveTab.kopiert : t.driveTab.linkKopieren}>
                      <button
                        onClick={() => linkTeilen(f.id)}
                        disabled={teilenId === f.id}
                        className={`text-xs border px-2 py-1 rounded-lg transition-colors disabled:opacity-50 ${
                          kopiert === f.id
                            ? "border-green-400 text-green-600 dark:text-green-400"
                            : "border-divider text-muted hover:text-fg"
                        }`}
                      >
                        {kopiert === f.id ? "✓" : teilenId === f.id ? "..." : "⎘"}
                      </button>
                      </Tooltip>
                      {f.webViewLink && (
                        <Tooltip label={t.driveTab.inDriveOeffnen}>
                        <a href={f.webViewLink} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-accent border border-accent/30 hover:border-accent px-2 py-1 rounded-lg transition-colors">
                          ↗
                        </a>
                        </Tooltip>
                      )}
                      <Tooltip label={t.driveTab.loeschen}>
                      <button onClick={() => dateiLoeschen(f.id)} disabled={loeschenId === f.id}
                        className="text-xs text-muted hover:text-red-500 border border-divider hover:border-red-300 px-2 py-1 rounded-lg transition-colors disabled:opacity-50">
                        {loeschenId === f.id ? "..." : "✕"}
                      </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </>
            )}
            {/* Inline-Vorschau */}
            {vorschau && (
              <div className="border-t border-divider px-4 py-4 bg-elevated/30">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-fg truncate">{vorschau.name}</p>
                  <button onClick={() => setVorschau(null)} className="text-muted hover:text-fg text-lg leading-none ml-2">×</button>
                </div>
                <DateizugriffVorschau
                  url={`/api/admin/drive/thumbnail?fileId=${vorschau.id}`}
                  mimeType={vorschau.mimeType}
                  proxyModus={true}
                />
                {vorschau.webViewLink && (
                  <a href={vorschau.webViewLink} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                    ↗ {t.driveTab.inDriveOeffnen}
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer mit Info */}
      {!laden && dateien.length > 0 && (
        <div className="px-4 py-2 border-t border-divider text-xs text-subtle">
          {ordner.length} {t.driveTab.ordnerStat} · {files.length} {files.length === 1 ? t.driveTab.datei : t.driveTab.dateien} · {t.driveTab.dragHinweis}
        </div>
      )}
    </div>
  );
}

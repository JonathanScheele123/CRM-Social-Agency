"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/components/ModalPortal";
import DrehtagModal from "@/components/admin/DrehtagModal";

type ContentIdea = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  prioritaet: string | null;
  status: string | null;
  notizen: string | null;
  captionText: string | null;
  dateizugriff: string | null;
  gewuenschtesPostingDatum: Date | null;
};

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  Facebook:  "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

const PRIORITAET_FARBEN: Record<string, string> = {
  Hoch:    "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Mittel:  "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  Niedrig: "bg-gray-100 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400",
};

function datumFormatieren(d: Date | null) {
  if (!d) return "–";
  return new Date(d).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function istFertig(idee: ContentIdea): boolean {
  return !!(idee.captionText?.trim() && idee.gewuenschtesPostingDatum);
}

function extractFolderId(url: string): string | null {
  const m = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

function DateiIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/vnd.google-apps.folder") return <span className="text-amber-500">📁</span>;
  if (mimeType.startsWith("video/")) return <span>🎬</span>;
  if (mimeType.startsWith("image/")) return <span>🖼</span>;
  if (mimeType === "application/pdf") return <span>📄</span>;
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return <span>📊</span>;
  if (mimeType.includes("document") || mimeType.includes("word")) return <span>📝</span>;
  return <span>📎</span>;
}

type BreadcrumbItem = { id: string; name: string };

function DriveAuswahlModal({
  rootFolderId,
  onAuswaehlen,
  onSchliessen,
}: {
  rootFolderId: string;
  onAuswaehlen: (link: string) => void;
  onSchliessen: () => void;
}) {
  const [pfad, setPfad] = useState<BreadcrumbItem[]>([{ id: rootFolderId, name: "Projektordner" }]);
  const [dateien, setDateien] = useState<DriveFile[] | null>(null);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const aktuellerOrdner = pfad[pfad.length - 1];

  async function laden_ordner(folderId: string) {
    setLaden(true);
    setFehler("");
    try {
      const res = await fetch(`/api/admin/drive?folderId=${folderId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDateien(data.files ?? []);
    } catch {
      setFehler("Dateien konnten nicht geladen werden.");
    } finally {
      setLaden(false);
    }
  }

  useEffect(() => { laden_ordner(rootFolderId); }, [rootFolderId]);

  function ordnerOeffnen(id: string, name: string) {
    setPfad(prev => [...prev, { id, name }]);
    laden_ordner(id);
  }

  function breadcrumbNavigieren(index: number) {
    const item = pfad[index];
    setPfad(prev => prev.slice(0, index + 1));
    laden_ordner(item.id);
  }

  function zurueck() {
    if (pfad.length <= 1) return;
    const newPfad = pfad.slice(0, -1);
    setPfad(newPfad);
    laden_ordner(newPfad[newPfad.length - 1].id);
  }

  const ordner = (dateien ?? []).filter(f => f.mimeType === "application/vnd.google-apps.folder");
  const files = (dateien ?? []).filter(f => f.mimeType !== "application/vnd.google-apps.folder");

  return (
    <ModalPortal>
    <div className="fixed inset-0 glass-overlay z-[60] flex items-center justify-center p-4" onClick={onSchliessen}>
      <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-divider flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-sm font-semibold text-fg">Datei aus Drive wählen</p>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {pfad.map((item, i) => (
                <span key={item.id} className="flex items-center gap-1 text-xs">
                  {i > 0 && <span className="text-subtle">/</span>}
                  <button
                    onClick={() => breadcrumbNavigieren(i)}
                    className={i === pfad.length - 1 ? "text-fg font-medium" : "text-muted hover:text-accent transition-colors"}
                  >
                    {item.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button onClick={onSchliessen} className="text-muted hover:text-fg transition-colors text-lg leading-none shrink-0">✕</button>
        </div>

        {/* Liste */}
        <div className="overflow-y-auto flex-1 divide-y divide-divider">
          {pfad.length > 1 && (
            <button onClick={zurueck} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-elevated transition-colors text-left">
              <span>↩</span><span>.. (zurück)</span>
            </button>
          )}
          {laden && <p className="text-center py-10 text-subtle text-sm">Laden...</p>}
          {fehler && <p className="text-center py-10 text-red-500 text-sm">{fehler}</p>}
          {!laden && !fehler && dateien !== null && (
            <>
              {ordner.map(f => (
                <button
                  key={f.id}
                  onClick={() => ordnerOeffnen(f.id, f.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg hover:bg-elevated transition-colors text-left"
                >
                  <DateiIcon mimeType={f.mimeType} />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-subtle text-xs">›</span>
                </button>
              ))}
              {files.map(f => (
                <button
                  key={f.id}
                  onClick={() => f.webViewLink && onAuswaehlen(f.webViewLink)}
                  disabled={!f.webViewLink}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-fg hover:bg-accent/5 hover:border-l-2 hover:border-l-accent transition-colors text-left disabled:opacity-40"
                >
                  <DateiIcon mimeType={f.mimeType} />
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-accent shrink-0">Auswählen</span>
                </button>
              ))}
              {ordner.length === 0 && files.length === 0 && (
                <p className="text-center py-10 text-subtle text-sm">Dieser Ordner ist leer.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

function ContentKarte({
  idee,
  cloudLink,
  onGespeichert,
  onAktiviert,
}: {
  idee: ContentIdea;
  cloudLink?: string | null;
  onGespeichert: (id: string, changes: Partial<ContentIdea>) => void;
  onAktiviert: (id: string) => void;
}) {
  const router = useRouter();
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");
  const [driveOffen, setDriveOffen] = useState(false);
  const datumRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    captionText: idee.captionText ?? "",
    geplantAm: idee.gewuenschtesPostingDatum
      ? new Date(idee.gewuenschtesPostingDatum).toISOString().slice(0, 16)
      : "",
    dateizugriff: idee.dateizugriff ?? "",
    notizen: idee.notizen ?? "",
  });

  function datumOeffnen() {
    if (!form.geplantAm) {
      const h = new Date();
      const val = `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}T16:00`;
      setForm(p => ({ ...p, geplantAm: val }));
      // showPicker needs the value already set — defer by one tick
      setTimeout(() => datumRef.current?.showPicker?.(), 0);
    } else {
      datumRef.current?.showPicker?.();
    }
  }

  const fertig = istFertig(idee);
  const rootFolderId = cloudLink ? extractFolderId(cloudLink) : null;

  function handleSpeichern(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    startTransition(async () => {
      const res = await fetch(`/api/content-planen/${idee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { setFehler("Fehler beim Speichern."); return; }
      onGespeichert(idee.id, {
        captionText: form.captionText || null,
        gewuenschtesPostingDatum: form.geplantAm ? new Date(form.geplantAm) : null,
        dateizugriff: form.dateizugriff || null,
        notizen: form.notizen || null,
      });
      setBearbeiten(false);
    });
  }

  function handleAktivieren() {
    setFehler("");
    startTransition(async () => {
      const res = await fetch(`/api/content-planen/${idee.id}/aktivieren`, { method: "POST" });
      if (!res.ok) { setFehler("Fehler bei der Automation."); return; }
      onAktiviert(idee.id);
      router.refresh();
    });
  }

  return (
    <>
      <div className={`bg-card border rounded-2xl overflow-hidden shadow-sm transition-all ${
        fertig ? "border-green-200 dark:border-green-600/40" : "border-divider"
      }`}>
        <div className="p-4">
          <h3 className="font-semibold text-sm text-fg mb-3 leading-snug">
            {idee.titel ?? idee.beschreibung?.slice(0, 60) ?? "Ohne Titel"}
          </h3>

          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-xs text-subtle w-24 shrink-0 pt-0.5">Posting-Datum</span>
              <span className={`text-xs font-medium ${idee.gewuenschtesPostingDatum ? "text-fg" : "text-subtle italic"}`}>
                {datumFormatieren(idee.gewuenschtesPostingDatum)}
              </span>
            </div>
            {idee.captionText ? (
              <div>
                <span className="text-xs text-subtle block mb-1">Caption</span>
                <p className="text-xs text-fg line-clamp-3 bg-elevated rounded-lg px-2 py-1.5 whitespace-pre-wrap leading-relaxed">
                  {idee.captionText}
                </p>
              </div>
            ) : (
              <p className="text-xs text-subtle italic">Kein Caption-Text</p>
            )}
            {idee.dateizugriff && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-subtle w-24 shrink-0">Datei</span>
                <a href={idee.dateizugriff} target="_blank" rel="noopener noreferrer"
                   className="text-xs text-accent hover:underline truncate">
                  ↗ Datei öffnen
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {idee.plattform.map(p => (
              <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>{p}</span>
            ))}
            {idee.contentTyp && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-elevated text-muted">{idee.contentTyp}</span>
            )}
            {idee.prioritaet && (
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITAET_FARBEN[idee.prioritaet] ?? ""}`}>{idee.prioritaet}</span>
            )}
          </div>

          {idee.beschreibung && idee.titel && (
            <p className="text-xs text-muted line-clamp-2 mb-2">{idee.beschreibung}</p>
          )}
          {idee.notizen && (
            <p className="text-xs text-subtle line-clamp-1 mb-3 italic">{idee.notizen}</p>
          )}

          {fehler && <p className="text-red-500 text-xs mb-2">{fehler}</p>}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setBearbeiten(!bearbeiten)}
              className="flex-1 text-xs py-2 rounded-lg border border-divider bg-elevated text-muted hover:text-fg transition-colors"
            >
              {bearbeiten ? "Abbrechen" : "Bearbeiten"}
            </button>
            {fertig && (
              <button
                onClick={handleAktivieren}
                disabled={pending}
                className="flex-1 text-xs py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors disabled:opacity-50"
              >
                {pending ? "..." : "▶ In Kalender"}
              </button>
            )}
          </div>
        </div>

        {bearbeiten && (
          <div className="border-t border-divider p-4 bg-elevated/50">
            <form onSubmit={handleSpeichern} className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Posting-Datum & Uhrzeit *</label>
                <div
                  onClick={datumOeffnen}
                  className="relative w-full cursor-pointer group"
                >
                  <div className={`w-full bg-card border rounded-xl px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${form.geplantAm ? "border-accent/50" : "border-divider"} group-hover:border-accent`}>
                    <span className={form.geplantAm ? "text-fg" : "text-subtle"}>
                      {form.geplantAm
                        ? new Date(form.geplantAm).toLocaleString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : "Datum & Uhrzeit wählen…"}
                    </span>
                    <span className="text-muted text-base shrink-0">📅</span>
                  </div>
                  <input
                    ref={datumRef}
                    type="datetime-local"
                    value={form.geplantAm}
                    onChange={e => setForm(p => ({ ...p, geplantAm: e.target.value }))}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    tabIndex={-1}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Caption / Text *</label>
                <textarea
                  value={form.captionText}
                  onChange={e => setForm(p => ({ ...p, captionText: e.target.value }))}
                  placeholder="Post-Text..."
                  className="w-full bg-card border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent min-h-[80px] resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Dateizugriff (Link)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.dateizugriff}
                    onChange={e => setForm(p => ({ ...p, dateizugriff: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 bg-card border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent"
                  />
                  {rootFolderId && (
                    <button
                      type="button"
                      onClick={() => setDriveOffen(true)}
                      title="Aus Drive wählen"
                      className="shrink-0 flex items-center gap-1.5 text-xs border border-divider text-muted hover:text-fg hover:border-accent px-3 py-2 rounded-xl transition-colors"
                    >
                      <span>📁</span> Durchsuchen
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Kommentar (optional)</label>
                <textarea
                  value={form.notizen}
                  onChange={e => setForm(p => ({ ...p, notizen: e.target.value }))}
                  placeholder="Interne Notiz..."
                  className="w-full bg-card border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent min-h-[60px] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2 transition-colors"
              >
                {pending ? "Speichert..." : "Speichern"}
              </button>
            </form>
          </div>
        )}
      </div>

      {driveOffen && rootFolderId && (
        <DriveAuswahlModal
          rootFolderId={rootFolderId}
          onAuswaehlen={link => {
            setForm(p => ({ ...p, dateizugriff: link }));
            setDriveOffen(false);
          }}
          onSchliessen={() => setDriveOffen(false)}
        />
      )}
    </>
  );
}

export default function ContentPlanenTab({
  ideen: initialIdeen,
  kundenprofilId,
  cloudLink,
  onIdeaAktiviert,
  drehtag,
  drehtageAdresse,
  drehtageStatus,
}: {
  ideen: ContentIdea[];
  kundenprofilId: string;
  cloudLink?: string | null;
  onIdeaAktiviert?: (id: string) => void;
  drehtag?: Date | null;
  drehtageAdresse?: string | null;
  drehtageStatus?: string | null;
}) {
  const router = useRouter();
  const [drehtagModalOffen, setDrehtagModalOffen] = useState(false);
  const [ideen, setIdeen] = useState(
    initialIdeen.filter(i => i.status === "Angenommen")
  );

  useEffect(() => {
    setIdeen(initialIdeen.filter(i => i.status === "Angenommen"));
  }, [initialIdeen]);
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkFehler, setBulkFehler] = useState("");

  function handleGespeichert(id: string, changes: Partial<ContentIdea>) {
    setIdeen(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i));
  }

  function handleAktiviert(id: string) {
    setIdeen(prev => prev.filter(i => i.id !== id));
    onIdeaAktiviert?.(id);
  }

  async function handleAlleInKalender() {
    setBulkFehler("");
    setBulkPending(true);
    const res = await fetch("/api/content-planen/bulk-aktivieren", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kundenprofilId }),
    });
    setBulkPending(false);
    if (res.ok) {
      setIdeen(prev => prev.filter(i => !istFertig(i)));
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setBulkFehler(d.fehler || "Fehler beim Übertragen.");
    }
  }

  const nochNichtBearbeitet = ideen.filter(i => !istFertig(i));
  const fertigZumPosten = ideen.filter(i => istFertig(i));
  const hatAktivenDrehtag = drehtag && drehtageStatus === "geplant";

  return (
    <div>
      {/* Drehtag-Bereich — immer sichtbar */}
      <div className={`flex items-center justify-between gap-4 mb-5 p-4 rounded-2xl border ${hatAktivenDrehtag ? "bg-accent/5 border-accent/20" : "bg-elevated border-divider"}`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${hatAktivenDrehtag ? "bg-accent/15" : "bg-divider"}`}>
            <svg className={`w-4 h-4 ${hatAktivenDrehtag ? "text-accent" : "text-muted"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.869V6a1 1 0 00-1-1H4a1 1 0 00-1 1v2.869a1 1 0 00.447.832L8 10m7 0v10H9V10m6 0H9" />
              <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" style={{display:"none"}}/>
            </svg>
          </div>
          {hatAktivenDrehtag && drehtag ? (
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-0.5">Drehtag geplant</p>
              <p className="text-sm font-semibold text-fg">
                {new Date(drehtag).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
                &nbsp;&middot;&nbsp;
                {new Date(drehtag).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
              </p>
              {drehtageAdresse && <p className="text-xs text-muted truncate">{drehtageAdresse}</p>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-fg">Kein Drehtag geplant</p>
              <p className="text-xs text-muted">Termin festlegen und automatisch E-Mail senden</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setDrehtagModalOffen(true)}
          className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${hatAktivenDrehtag ? "bg-accent/15 hover:bg-accent/25 text-accent" : "bg-accent hover:bg-accent/90 text-white"}`}
        >
          {hatAktivenDrehtag ? "Bearbeiten" : "Drehtag planen"}
        </button>
      </div>

      {drehtagModalOffen && (
        <DrehtagModal
          kundenprofilId={kundenprofilId}
          aktuell={{ drehtag: drehtag ?? null, drehtageAdresse: drehtageAdresse ?? null, drehtageStatus: drehtageStatus ?? null }}
          onClose={() => setDrehtagModalOffen(false)}
        />
      )}

      {ideen.length === 0 ? (
        <div className="text-center py-12 text-subtle border border-dashed border-divider rounded-2xl">
          <p className="text-base mb-1 font-medium">Keine angenommenen Ideen</p>
          <p className="text-sm">Gehe zu Content-Ideen und nehme Ideen an, um sie hier zu planen.</p>
        </div>
      ) : (
      <>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="font-semibold text-lg text-fg">Content planen</h2>
          <p className="text-sm text-muted mt-0.5">
            Trage Posting-Datum und Caption ein — sobald beides ausgefüllt ist, kann der Beitrag in den Kalender übertragen werden.
          </p>
        </div>
        {fertigZumPosten.length > 0 && (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleAlleInKalender}
              disabled={bulkPending}
              className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors shrink-0"
            >
              {bulkPending ? "Wird eingetragen..." : `▶ Alle in Kalender eintragen (${fertigZumPosten.length})`}
            </button>
            {bulkFehler && <p className="text-red-500 text-xs">{bulkFehler}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
            <h3 className="font-medium text-sm text-fg">Noch nicht bearbeitet</h3>
            <span className="ml-auto text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">{nochNichtBearbeitet.length}</span>
          </div>
          <div className="space-y-3 card-group">
            {nochNichtBearbeitet.map(idee => (
              <ContentKarte key={idee.id} idee={idee} cloudLink={cloudLink} onGespeichert={handleGespeichert} onAktiviert={handleAktiviert} />
            ))}
            {nochNichtBearbeitet.length === 0 && (
              <p className="text-center py-8 text-subtle text-sm border border-dashed border-divider rounded-2xl">
                Alle Ideen sind bereit ✓
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <h3 className="font-medium text-sm text-fg">Fertig zum Posten</h3>
            <span className="ml-auto text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">{fertigZumPosten.length}</span>
          </div>
          <div className="space-y-3 card-group">
            {fertigZumPosten.map(idee => (
              <ContentKarte key={idee.id} idee={idee} cloudLink={cloudLink} onGespeichert={handleGespeichert} onAktiviert={handleAktiviert} />
            ))}
            {fertigZumPosten.length === 0 && (
              <p className="text-center py-8 text-subtle text-sm border border-dashed border-divider rounded-2xl">
                Noch keine fertigen Beiträge
              </p>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

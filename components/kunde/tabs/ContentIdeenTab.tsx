"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { flushSync } from "react-dom";
import { PostLimitsNachTyp } from "@/components/shared/FreigabeListeAnsicht";
import { useT, useLang } from "@/lib/i18n";

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
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
  kommentare: Kommentar[];
};

const PRIORITAET_RANG: Record<string, number> = { Hoch: 0, Mittel: 1, Niedrig: 2 };

const PRIORITAET_FARBEN: Record<string, string> = {
  Hoch:    "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Mittel:  "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  Niedrig: "bg-gray-100 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400",
};

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

const CONTENT_TYP_BADGE: Record<string, { label: string; icon: string; cls: string }> = {
  Reel:      { label: "Reel",      icon: "▶",  cls: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30" },
  Story:     { label: "Story",     icon: "◎",  cls: "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30" },
  Bild:      { label: "Bild",      icon: "◻",  cls: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30" },
  Karussell: { label: "Karussell", icon: "⊞",  cls: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30" },
};

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];
const SPALTEN: Array<"Offen" | "Angenommen" | "Verworfen"> = ["Offen", "Angenommen", "Verworfen"];

const SPALTEN_DOT: Record<string, string> = {
  Offen:      "bg-yellow-400",
  Angenommen: "bg-green-500",
  Verworfen:  "bg-gray-400",
};

// ─── Einreich-Formular ───────────────────────────────────────────────────────

function IdeaEinreichenForm({
  kundenprofilId,
  onErfolg,
}: {
  kundenprofilId: string;
  onErfolg: (neueIdee: ContentIdea) => void;
}) {
  const t = useT();
  const [offen, setOffen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");
  const [form, setForm] = useState({
    beschreibung: "",
    plattform: [] as string[],
    contentTyp: "Reel",
    prioritaet: "",
    gewuenschtesPostingDatum: "",
  });

  function toggleP(p: string) {
    setForm(prev => ({
      ...prev,
      plattform: prev.plattform.includes(p)
        ? prev.plattform.filter(x => x !== p)
        : [...prev.plattform, p],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.beschreibung.trim()) return;
    setFehler("");
    startTransition(async () => {
      const res = await fetch("/api/ideen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, prioritaet: form.prioritaet || null, kundenprofilId }),
      });
      if (!res.ok) { setFehler(t.contentIdeen.fehlerEinreichen); return; }
      const data = await res.json();
      onErfolg({
        id: data.id,
        titel: null,
        beschreibung: form.beschreibung,
        plattform: form.plattform,
        contentTyp: form.contentTyp || null,
        eingereichtVon: "Kunde",
        prioritaet: form.prioritaet || null,
        status: "Offen",
        notizen: null,
        gewuenschtesPostingDatum: form.gewuenschtesPostingDatum ? new Date(form.gewuenschtesPostingDatum) : null,
        captionText: null,
        dateizugriff: null,
        createdAt: new Date(),
        kommentare: [],
      });
      setForm({ beschreibung: "", plattform: [], contentTyp: "Reel", prioritaet: "", gewuenschtesPostingDatum: "" });
      setOffen(false);
    });
  }

  if (!offen) {
    return (
      <button
        onClick={() => setOffen(true)}
        className="w-full border-2 border-dashed border-divider hover:border-accent/50 rounded-xl p-3 text-muted hover:text-accent text-sm transition-colors flex items-center justify-center gap-2 mt-2"
      >
        <span className="text-base">+</span> {t.contentIdeen.eigeneIdee}
      </button>
    );
  }

  return (
    <div className="bg-card border border-accent/20 rounded-xl p-4 space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-accent">{t.contentIdeen.neueIdee}</h3>
        <button onClick={() => setOffen(false)} className="text-subtle hover:text-fg text-xs">{t.common.abbrechen}</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={form.beschreibung}
          onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))}
          placeholder={t.contentIdeen.beschreibungPlaceholder}
          required
          className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent min-h-[70px] resize-none"
        />
        <div className="flex flex-wrap gap-1">
          {PLATTFORMEN.map(p => (
            <button key={p} type="button" onClick={() => toggleP(p)}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                form.plattform.includes(p)
                  ? "bg-accent border-accent text-white"
                  : "bg-elevated border-divider text-muted hover:text-fg"
              }`}
            >{p}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select value={form.contentTyp} onChange={e => setForm(p => ({ ...p, contentTyp: e.target.value }))}
            className="bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent">
            {CONTENT_TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="date" value={form.gewuenschtesPostingDatum}
            onChange={e => setForm(p => ({ ...p, gewuenschtesPostingDatum: e.target.value }))}
            className="bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-accent" />
        </div>
        <div>
          <p className="text-xs text-muted mb-1.5">{t.contentIdeen.prioritaet}</p>
          <div className="flex gap-1.5">
            {([
              { wert: "Hoch",    label: t.contentIdeen.hoch,    cls: "bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300" },
              { wert: "Mittel",  label: t.contentIdeen.mittel,  cls: "bg-yellow-100 dark:bg-yellow-500/20 border-yellow-300 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-300" },
              { wert: "Niedrig", label: t.contentIdeen.niedrig, cls: "bg-gray-100 dark:bg-gray-500/20 border-gray-300 dark:border-gray-500/40 text-gray-600 dark:text-gray-400" },
            ]).map(({ wert, label, cls }) => (
              <button key={wert} type="button"
                onClick={() => setForm(prev => ({ ...prev, prioritaet: prev.prioritaet === wert ? "" : wert }))}
                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                  form.prioritaet === wert ? cls : "bg-elevated border-divider text-muted hover:text-fg"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {fehler && <p className="text-red-500 text-xs">{fehler}</p>}
        <button type="submit" disabled={pending || !form.beschreibung.trim()}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2 transition-colors">
          {pending ? t.contentIdeen.wirdEingereicht : t.contentIdeen.einreichen}
        </button>
      </form>
    </div>
  );
}

// ─── Kommentar-Bereich ────────────────────────────────────────────────────────

function KommentarBereich({ ideaId, kommentare, onNeu }: {
  ideaId: string;
  kommentare: Kommentar[];
  onNeu: (k: Kommentar) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");

  function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setFehler("");
    startTransition(async () => {
      const res = await fetch(`/api/ideen/${ideaId}/kommentare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) { setFehler(t.contentIdeen.fehlerSenden); return; }
      const data = await res.json();
      onNeu({ ...data, createdAt: new Date(data.createdAt) });
      setText("");
    });
  }

  return (
    <div className="border-t border-divider pt-4 mt-4">
      <p className="text-xs text-muted font-medium mb-3">
        {t.contentIdeen.kommentare} {kommentare.length > 0 && `(${kommentare.length})`}
      </p>
      {kommentare.length > 0 && (
        <div className="space-y-2 mb-3">
          {kommentare.map(k => (
            <div key={k.id} className={`rounded-xl px-3 py-2.5 text-sm ${
              k.autorTyp === "Agentur"
                ? "bg-accent/5 dark:bg-accent/10 border border-accent/20"
                : "bg-elevated border border-divider"
            }`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-medium ${k.autorTyp === "Agentur" ? "text-accent" : "text-fg"}`}>
                  {k.autorTyp === "Agentur" ? t.contentIdeen.agenturLabel : (k.autorName ?? t.contentIdeen.kundeLabel)}
                </span>
                <span className="text-xs text-subtle">
                  {new Date(k.createdAt).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-fg whitespace-pre-wrap">{k.text}</p>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={absenden} className="flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)}
          placeholder={t.contentIdeen.kommentarSchreiben}
          className="flex-1 bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent" />
        <button type="submit" disabled={pending || !text.trim()}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl transition-colors shrink-0">
          {pending ? "..." : t.common.senden}
        </button>
      </form>
      {fehler && <p className="text-red-500 text-xs mt-1">{fehler}</p>}
    </div>
  );
}

// ─── Detail-Modal ─────────────────────────────────────────────────────────────

function IdeaDetailModal({ idee, onSchliessen, onGespeichert, onKommentarHinzugefuegt, origin }: {
  idee: ContentIdea;
  onSchliessen: () => void;
  onGespeichert: (aktualisiert: Partial<ContentIdea>) => void;
  onKommentarHinzugefuegt: (ideaId: string, k: Kommentar) => void;
  origin?: { x: number; y: number };
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [bearbeitenModus, setBearbeitenModus] = useState(false);
  const [pending, startTransition] = useTransition();
  const [fehler, setFehler] = useState("");
  const [editForm, setEditForm] = useState({
    beschreibung: idee.beschreibung ?? "",
    plattform: idee.plattform,
    contentTyp: idee.contentTyp ?? "",
    gewuenschtesPostingDatum: idee.gewuenschtesPostingDatum
      ? new Date(idee.gewuenschtesPostingDatum).toISOString().split("T")[0]
      : "",
  });

  function toggleP(p: string) {
    setEditForm(prev => ({
      ...prev,
      plattform: prev.plattform.includes(p) ? prev.plattform.filter(x => x !== p) : [...prev.plattform, p],
    }));
  }

  function handleSpeichern(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    startTransition(async () => {
      const res = await fetch(`/api/ideen/${idee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beschreibung: editForm.beschreibung,
          plattform: editForm.plattform,
          contentTyp: editForm.contentTyp || null,
          gewuenschtesPostingDatum: editForm.gewuenschtesPostingDatum || null,
        }),
      });
      if (!res.ok) { setFehler(t.contentIdeen.fehlerSpeichern); return; }
      onGespeichert({
        beschreibung: editForm.beschreibung,
        plattform: editForm.plattform,
        contentTyp: editForm.contentTyp || null,
        gewuenschtesPostingDatum: editForm.gewuenschtesPostingDatum ? new Date(editForm.gewuenschtesPostingDatum) : null,
      });
      setBearbeitenModus(false);
    });
  }

  const kannBearbeiten = idee.eingereichtVon === "Kunde";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const mobilePos = (isMobile && origin) ? (() => {
    const top = Math.max(16, Math.min(origin.y - 60, window.innerHeight * 0.55));
    return { top, originX: origin.x - 16, originY: origin.y - top };
  })() : null;

  return (
    <div
      className={`fixed inset-0 glass-overlay z-50 ${mobilePos ? "" : "flex items-center justify-center p-4"}`}
      onClick={onSchliessen}
    >
      <div
        className="glass-modal rounded-2xl p-6 w-full max-w-lg max-h-[90svh] overflow-y-auto animate-modal-pop"
        style={mobilePos
          ? { position: "fixed", top: mobilePos.top, left: 16, right: 16, transformOrigin: `${mobilePos.originX}px ${mobilePos.originY}px` }
          : { transformOrigin: "center center" }
        }
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-semibold text-fg">{idee.titel ?? (idee.beschreibung?.slice(0, 40) ?? "Idee")}</h3>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {kannBearbeiten && !bearbeitenModus && (
              <button onClick={() => setBearbeitenModus(true)}
                className="text-xs text-accent hover:text-accent-hover px-2.5 py-1 rounded-lg bg-accent/10 border border-accent/20 transition-colors">
                {t.common.bearbeiten}
              </button>
            )}
            <button onClick={onSchliessen} className="text-muted hover:text-fg transition-colors">✕</button>
          </div>
        </div>

        {bearbeitenModus ? (
          <form onSubmit={handleSpeichern} className="space-y-3 mb-4">
            <textarea value={editForm.beschreibung} onChange={e => setEditForm(p => ({ ...p, beschreibung: e.target.value }))}
              required className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent min-h-[80px] resize-none" />
            <div className="flex flex-wrap gap-1.5">
              {PLATTFORMEN.map(p => (
                <button key={p} type="button" onClick={() => toggleP(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    editForm.plattform.includes(p) ? "bg-accent border-accent text-white" : "bg-elevated border-divider text-muted hover:text-fg"
                  }`}>{p}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={editForm.contentTyp} onChange={e => setEditForm(p => ({ ...p, contentTyp: e.target.value }))}
                className="bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent">
                <option value="">–</option>
                {CONTENT_TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="date" value={editForm.gewuenschtesPostingDatum}
                onChange={e => setEditForm(p => ({ ...p, gewuenschtesPostingDatum: e.target.value }))}
                className="bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
            {fehler && <p className="text-red-500 text-xs">{fehler}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setBearbeitenModus(false)}
                className="flex-1 bg-elevated text-fg text-sm rounded-xl py-2 hover:opacity-80 border border-divider transition-opacity">{t.common.abbrechen}</button>
              <button type="submit" disabled={pending}
                className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm rounded-xl py-2 transition-colors">
                {pending ? t.contentIdeen.speichert : t.common.speichern}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm mb-4">
            {idee.beschreibung && (
              <div><p className="text-subtle text-xs mb-1">{t.contentIdeen.beschreibungLabel}</p><p className="text-fg">{idee.beschreibung}</p></div>
            )}
            {idee.captionText && (
              <div><p className="text-subtle text-xs mb-1">{t.contentIdeen.caption}</p><p className="text-fg whitespace-pre-wrap">{idee.captionText}</p></div>
            )}
            {idee.notizen && (
              <div><p className="text-subtle text-xs mb-1">{t.contentIdeen.agenturNotizen}</p><p className="text-muted">{idee.notizen}</p></div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {idee.plattform.map(p => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>{p}</span>
              ))}
              {idee.contentTyp && <span className="text-xs px-1.5 py-0.5 rounded-md bg-elevated text-muted">{idee.contentTyp}</span>}
              {idee.prioritaet && <span className={`text-xs px-1.5 py-0.5 rounded-md ${PRIORITAET_FARBEN[idee.prioritaet] ?? ""}`}>{idee.prioritaet}</span>}
            </div>
            {idee.gewuenschtesPostingDatum && (
              <div><p className="text-subtle text-xs mb-1">{t.contentIdeen.gewuenschtesDatum}</p>
                <p className="text-fg">{new Date(idee.gewuenschtesPostingDatum).toLocaleDateString(dateLocale)}</p>
              </div>
            )}
            {idee.dateizugriff && (
              <a href={idee.dateizugriff} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline block text-sm">{t.kalenderTab.dateiOeffnen}</a>
            )}
          </div>
        )}

        <KommentarBereich ideaId={idee.id} kommentare={idee.kommentare} onNeu={k => onKommentarHinzugefuegt(idee.id, k)} />
      </div>
    </div>
  );
}

// ─── Kanban-Karte ─────────────────────────────────────────────────────────────

function KanbanKarte({ idee, onKlick, onStatusAendern, pending, limitErreicht, gesperrt = false }: {
  idee: ContentIdea;
  onKlick: (e: React.MouseEvent) => void;
  onStatusAendern: (neuerStatus: string, kommentar?: string) => void;
  pending: boolean;
  limitErreicht: boolean;
  gesperrt?: boolean;
}) {
  const t = useT();
  const [aktion, setAktion] = useState<{ status: "Angenommen" | "Verworfen"; kommentar: string } | null>(null);

  function bestaetigen() {
    if (!aktion) return;
    onStatusAendern(aktion.status, aktion.kommentar || undefined);
    setAktion(null);
  }

  return (
    <div
      draggable={!aktion && !gesperrt}
      onDragStart={e => e.dataTransfer.setData("ideaId", idee.id)}
      className={`rounded-2xl p-3 shadow-sm transition-all border ${
        gesperrt
          ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/50 cursor-not-allowed"
          : "glass-modal hover:shadow-md hover:border-muted/40 cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-start gap-2 cursor-pointer mb-2" onClick={aktion ? undefined : (e) => onKlick(e)}>
        {idee.contentTyp && CONTENT_TYP_BADGE[idee.contentTyp] && (
          <span className={`shrink-0 mt-0.5 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg border ${CONTENT_TYP_BADGE[idee.contentTyp].cls}`}>
            <span>{CONTENT_TYP_BADGE[idee.contentTyp].icon}</span>
            {CONTENT_TYP_BADGE[idee.contentTyp].label}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-fg line-clamp-2 leading-snug">
            {idee.titel ?? idee.beschreibung?.slice(0, 50) ?? t.common.ohneTitle}
          </p>
          {idee.beschreibung && idee.titel && (
            <p className="text-muted text-xs line-clamp-1 mt-0.5">{idee.beschreibung}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2.5" onClick={aktion ? undefined : (e) => onKlick(e)}>
        {idee.plattform.slice(0, 2).map(p => (
          <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>{p}</span>
        ))}
        {idee.plattform.length > 2 && <span className="text-xs text-subtle">+{idee.plattform.length - 2}</span>}
        {idee.kommentare.length > 0 && (
          <span className="text-xs text-subtle ml-auto">💬 {idee.kommentare.length}</span>
        )}
      </div>

      {/* Bestätigungs-Dialog */}
      {aktion && (
        <div className="space-y-2 mb-2">
          <p className="text-xs text-muted">
            {aktion.status === "Angenommen" ? t.contentIdeen.kommentarAnnehmen : t.contentIdeen.grundAblehnen}
          </p>
          <textarea
            value={aktion.kommentar}
            onChange={e => setAktion(p => p ? { ...p, kommentar: e.target.value } : null)}
            placeholder={t.contentIdeen.kommentarPlaceholder}
            autoFocus
            className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-xs placeholder:text-subtle focus:outline-none focus:border-accent min-h-[60px] resize-none"
          />
          <div className="flex gap-1.5">
            <button onClick={() => setAktion(null)}
              className="flex-1 text-xs py-1.5 rounded-lg bg-elevated text-muted border border-divider hover:text-fg transition-colors">
              {t.common.abbrechen}
            </button>
            <button onClick={bestaetigen} disabled={pending}
              className={`flex-1 text-xs py-1.5 rounded-lg text-white font-medium transition-colors disabled:opacity-40 ${
                aktion.status === "Angenommen"
                  ? "bg-green-600 hover:bg-green-500"
                  : "bg-red-600 hover:bg-red-500"
              }`}>
              {pending ? "..." : aktion.status === "Angenommen" ? t.contentIdeen.bestaetigen : t.contentIdeen.verwerfen2}
            </button>
          </div>
        </div>
      )}

      {!aktion && !gesperrt && (
        <div className="flex gap-1.5 btn-group">
          {idee.status === "Offen" && (
            <>
              <button
                disabled={pending || limitErreicht}
                onClick={() => setAktion({ status: "Angenommen", kommentar: "" })}
                title={limitErreicht ? t.contentIdeen.limitTooltip : undefined}
                className="flex-1 text-xs py-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {t.contentIdeen.annehmen}
              </button>
              <button disabled={pending} onClick={() => setAktion({ status: "Verworfen", kommentar: "" })}
                className="flex-1 text-xs py-1.5 rounded-lg bg-elevated text-muted hover:text-red-600 dark:hover:text-red-400 border border-divider transition-colors disabled:opacity-40">
                {t.contentIdeen.verwerfen2}
              </button>
            </>
          )}
          {idee.status === "Angenommen" && (
            <button disabled={pending} onClick={() => onStatusAendern("Offen")}
              className="flex-1 text-xs py-1.5 rounded-lg bg-elevated text-muted hover:text-fg border border-divider transition-colors disabled:opacity-40">
              {t.contentIdeen.zurueckOffen}
            </button>
          )}
          {idee.status === "Verworfen" && (
            <button disabled={pending} onClick={() => onStatusAendern("Offen")}
              className="flex-1 text-xs py-1.5 rounded-lg bg-elevated text-muted hover:text-fg border border-divider transition-colors disabled:opacity-40">
              {t.contentIdeen.wiederoeffnen}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

const CONTENT_TYP_KEYS: (keyof PostLimitsNachTyp)[] = ["Reel", "Story", "Bild", "Karussell"];

export default function ContentIdeenTab({
  ideen,
  kundenprofilId,
  postLimit = null,
  postLimits,
  onStatusChange,
  onIdeaUpdate,
  onKommentarAdded,
  gesperrt = false,
}: {
  ideen: ContentIdea[];
  kundenprofilId: string;
  postLimit?: number | null;
  postLimits?: PostLimitsNachTyp;
  onStatusChange: (id: string, neuerStatus: string, kommentar?: string) => Promise<void>;
  onIdeaUpdate: (id: string, aenderungen: Partial<ContentIdea>) => void;
  onKommentarAdded: (ideaId: string, k: Kommentar) => void;
  gesperrt?: boolean;
}) {
  const t = useT();
  const spaltenLabel: Record<string, string> = {
    Offen: t.contentIdeen.offen,
    Angenommen: t.contentIdeen.angenommen,
    Verworfen: t.contentIdeen.verworfen,
  };
  const [lokalIdeen, setLokalIdeen] = useState<ContentIdea[]>(ideen);
  const [ausgewaehlt, setAusgewaehlt] = useState<ContentIdea | null>(null);
  const [klickOrigin, setKlickOrigin] = useState<{ x: number; y: number } | undefined>();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  // Sync local state when parent changes (additions, rollbacks, external changes)
  useEffect(() => {
    setLokalIdeen(ideen);
  }, [ideen]);

  async function statusAendern(id: string, neuerStatus: string, kommentar?: string) {
    // flushSync guarantees the DOM updates synchronously before the async fetch starts
    flushSync(() => {
      setPendingIds(prev => new Set(prev).add(id));
      setLokalIdeen(prev => prev.map(i => i.id === id ? { ...i, status: neuerStatus } : i));
      setAusgewaehlt(prev => prev?.id === id ? { ...prev, status: neuerStatus } : prev);
    });

    await onStatusChange(id, neuerStatus, kommentar);

    setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  function ideaAktualisieren(id: string, aenderungen: Partial<ContentIdea>) {
    onIdeaUpdate(id, aenderungen);
    setAusgewaehlt(prev => prev?.id === id ? { ...prev, ...aenderungen } : prev);
  }

  function kommentarHinzufuegen(ideaId: string, k: Kommentar) {
    onKommentarAdded(ideaId, k);
    setAusgewaehlt(prev => prev?.id === ideaId ? { ...prev, kommentare: [...prev.kommentare, k] } : prev);
  }

  function handleDrop(e: React.DragEvent, spalte: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("ideaId") || dragIdRef.current;
    if (id) {
      if (spalte === "Angenommen") {
        const gezogeneIdee = lokalIdeen.find(i => i.id === id);
        if (gezogeneIdee && istTypLimitErreicht(gezogeneIdee.contentTyp)) {
          setDragOver(null);
          dragIdRef.current = null;
          return;
        }
      }
      statusAendern(id, spalte);
    }
    setDragOver(null);
    dragIdRef.current = null;
  }

  const angenommenAnzahl = lokalIdeen.filter(i => i.status === "Angenommen").length;

  const angenommenProTyp: Partial<Record<keyof PostLimitsNachTyp, number>> = {};
  if (postLimits) {
    for (const idee of lokalIdeen) {
      if (idee.status === "Angenommen" && idee.contentTyp && idee.contentTyp in postLimits) {
        const k = idee.contentTyp as keyof PostLimitsNachTyp;
        angenommenProTyp[k] = (angenommenProTyp[k] ?? 0) + 1;
      }
    }
  }

  const typMitLimit = postLimits
    ? CONTENT_TYP_KEYS.filter(k => (postLimits[k] ?? 0) > 0)
    : [];
  const hatTypLimits = typMitLimit.length > 0;

  function istTypLimitErreicht(contentTyp: string | null): boolean {
    if (hatTypLimits && postLimits) {
      const typ = contentTyp as keyof PostLimitsNachTyp | null;
      if (!typ || !(typ in postLimits)) return true;
      const limit = postLimits[typ];
      if (limit === null || limit === undefined) return true;
      return (angenommenProTyp[typ] ?? 0) >= limit;
    }
    return postLimit !== null && angenommenAnzahl >= postLimit;
  }

  const limitErreicht = hatTypLimits
    ? typMitLimit.every(k => (angenommenProTyp[k] ?? 0) >= (postLimits![k] ?? 0))
    : postLimit !== null && angenommenAnzahl >= postLimit;

  const ideenProSpalte = (spalte: string) => {
    const filtered = lokalIdeen.filter(i => (i.status ?? "Offen") === spalte);
    if (spalte === "Angenommen") {
      return filtered.sort((a, b) =>
        (PRIORITAET_RANG[a.prioritaet ?? ""] ?? 3) - (PRIORITAET_RANG[b.prioritaet ?? ""] ?? 3)
      );
    }
    return filtered;
  };

  // Mobile: only Offen + Angenommen sections (stacked)
  // Desktop: 3-column kanban

  return (
    <div>
      {/* Limit-Banner: per Typ */}
      {hatTypLimits && postLimits && (
        <div className="mb-4 rounded-xl border border-divider bg-elevated overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider">
            <p className="text-xs font-semibold text-subtle uppercase tracking-wide">{t.contentIdeen.monatlichesLimit}</p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2">
            {typMitLimit.map(typ => {
              const limit = postLimits[typ] ?? 0;
              const count = angenommenProTyp[typ] ?? 0;
              const voll = count >= limit;
              return (
                <div key={typ} className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${voll ? "text-orange-600 dark:text-orange-400" : "text-fg"}`}>{typ}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                    voll
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                      : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  }`}>{count}/{limit}</span>
                </div>
              );
            })}
          </div>
          {gesperrt ? (
            <div className="px-4 pb-3 pt-1 text-xs text-red-700 dark:text-red-300 font-medium">
              {t.contentIdeen.keineWeiterenFreigaben}
            </div>
          ) : typMitLimit.some(typ => (angenommenProTyp[typ] ?? 0) >= (postLimits[typ] ?? 0)) && (() => {
            const volleTypen = typMitLimit.filter(typ => (angenommenProTyp[typ] ?? 0) >= (postLimits[typ] ?? 0));
            const offeneTypen = typMitLimit.filter(typ => (angenommenProTyp[typ] ?? 0) < (postLimits[typ] ?? 0));
            return (
              <div className="px-4 pb-3 pt-1 text-xs text-orange-700 dark:text-orange-300">
                <span className="font-medium">{volleTypen.join(", ")}-{t.contentIdeen.limitErreicht}</span>
                {offeneTypen.length > 0 && (
                  <span className="text-muted ml-1">
                    {t.contentIdeen.nochMoeglich} {offeneTypen.map(typ => `${(postLimits[typ] ?? 0) - (angenommenProTyp[typ] ?? 0)} ${typ}`).join(", ")}.
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Fallback: einfaches Gesamtlimit ohne Typ-Aufschlüsselung */}
      {!hatTypLimits && postLimit !== null && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border ${
          gesperrt
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300"
            : limitErreicht
            ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700/50 text-orange-700 dark:text-orange-300"
            : "bg-elevated border-divider text-muted"
        }`}>
          <span>{angenommenAnzahl} / {postLimit} {t.contentIdeen.beitraegeFreigegeben}</span>
          {gesperrt && <span className="font-medium ml-1">— {t.contentIdeen.beitraegeGeplant}</span>}
          {!gesperrt && limitErreicht && <span className="font-medium ml-1">— {t.contentIdeen.monatlichLimitErreicht}</span>}
        </div>
      )}

      {/* Desktop Kanban */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        {SPALTEN.map(spalte => {
          const spaltenIdeen = ideenProSpalte(spalte);
          return (
            <div
              key={spalte}
              onDragOver={e => { if (!gesperrt) { e.preventDefault(); setDragOver(spalte); } }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => !gesperrt && handleDrop(e, spalte)}
              className={`min-h-[200px] rounded-2xl transition-colors p-3 ${
                gesperrt
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40"
                  : dragOver === spalte
                    ? spalte === "Angenommen" && limitErreicht
                      ? "bg-red-500/5 ring-2 ring-red-400/30"
                      : "bg-accent/5 ring-2 ring-accent/20"
                    : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${gesperrt ? "bg-red-400" : SPALTEN_DOT[spalte]}`} />
                <h3 className={`font-medium text-sm ${gesperrt ? "text-red-700 dark:text-red-400" : "text-fg"}`}>{spaltenLabel[spalte]}</h3>
                <span className="ml-auto text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">{spaltenIdeen.length}</span>
              </div>
              <div className="space-y-2 card-group">
                {spaltenIdeen.map(idee => (
                  <KanbanKarte
                    key={idee.id}
                    idee={idee}
                    onKlick={(e) => { setKlickOrigin({ x: e.clientX, y: e.clientY }); setAusgewaehlt(idee); }}
                    onStatusAendern={(s, k) => statusAendern(idee.id, s, k)}
                    pending={pendingIds.has(idee.id)}
                    limitErreicht={istTypLimitErreicht(idee.contentTyp)}
                    gesperrt={gesperrt}
                  />
                ))}
                {spaltenIdeen.length === 0 && !dragOver && (
                  <p className="text-center py-6 text-subtle text-xs border border-dashed border-divider rounded-xl">{t.contentIdeen.keineIdeen}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: stacked sections */}
      <div className="md:hidden space-y-6">
        {(["Offen", "Angenommen"] as const).map(spalte => {
          const spaltenIdeen = ideenProSpalte(spalte);
          return (
            <div key={spalte} className={`rounded-2xl p-3 ${gesperrt ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40" : ""}`}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${gesperrt ? "bg-red-400" : SPALTEN_DOT[spalte]}`} />
                <h3 className={`font-medium text-sm ${gesperrt ? "text-red-700 dark:text-red-400" : "text-fg"}`}>{spaltenLabel[spalte]}</h3>
                <span className="ml-auto text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">{spaltenIdeen.length}</span>
              </div>
              <div className="space-y-2">
                {spaltenIdeen.map(idee => (
                  <KanbanKarte
                    key={idee.id}
                    idee={idee}
                    onKlick={(e) => { setKlickOrigin({ x: e.clientX, y: e.clientY }); setAusgewaehlt(idee); }}
                    onStatusAendern={(s, k) => statusAendern(idee.id, s, k)}
                    pending={pendingIds.has(idee.id)}
                    limitErreicht={istTypLimitErreicht(idee.contentTyp)}
                    gesperrt={gesperrt}
                  />
                ))}
                {spaltenIdeen.length === 0 && (
                  <p className="text-center py-6 text-subtle text-xs border border-dashed border-divider rounded-xl">{t.contentIdeen.keineIdeen}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Verworfen collapsible on mobile */}
        {ideenProSpalte("Verworfen").length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-divider">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-gray-400" />
              <h3 className="font-medium text-sm text-fg">{t.contentIdeen.verworfen}</h3>
              <span className="ml-auto text-xs bg-elevated text-muted px-2 py-0.5 rounded-full">{ideenProSpalte("Verworfen").length}</span>
            </div>
            <div className="space-y-2">
              {ideenProSpalte("Verworfen").map(idee => (
                <KanbanKarte
                  key={idee.id}
                  idee={idee}
                  onKlick={(e) => { setKlickOrigin({ x: e.clientX, y: e.clientY }); setAusgewaehlt(idee); }}
                  onStatusAendern={(s, k) => statusAendern(idee.id, s, k)}
                  pending={pendingIds.has(idee.id)}
                  limitErreicht={limitErreicht}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {ausgewaehlt && (
        <IdeaDetailModal
          idee={ausgewaehlt}
          onSchliessen={() => setAusgewaehlt(null)}
          onGespeichert={aenderungen => ideaAktualisieren(ausgewaehlt.id, aenderungen)}
          onKommentarHinzugefuegt={kommentarHinzufuegen}
          origin={klickOrigin}
        />
      )}
    </div>
  );
}

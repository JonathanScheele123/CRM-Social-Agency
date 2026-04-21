"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import ContentIdeenTab from "./ContentIdeenTab";
import FreigabeListeAnsicht, { FreigabeIdee, PostLimitsNachTyp } from "@/components/shared/FreigabeListeAnsicht";
import { useT } from "@/lib/i18n";

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
};

type ContentIdea = Parameters<typeof ContentIdeenTab>[0]["ideen"][number];

const PLATTFORMEN = ["Instagram", "Facebook", "TikTok", "YouTube", "Sonstiges"];
const CONTENT_TYPEN = ["Reel", "Story", "Bild", "Karussell"];

function IdeaEinreichenModal({
  kundenprofilId,
  onErfolg,
  onSchliessen,
}: {
  kundenprofilId: string;
  onErfolg: (idee: ContentIdea) => void;
  onSchliessen: () => void;
}) {
  const t = useT();
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
        body: JSON.stringify({ ...form, kundenprofilId }),
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
      onSchliessen();
    });
  }

  return (
    <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={onSchliessen}>
      <div className="glass-modal rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-fg">{t.contentIdeen.eigeneIdee}</h3>
          <button onClick={onSchliessen} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.contentIdeen.beschreibung}</label>
            <textarea
              value={form.beschreibung}
              onChange={e => setForm(p => ({ ...p, beschreibung: e.target.value }))}
              placeholder={t.contentIdeen.beschreibungPlaceholder}
              required
              autoFocus
              className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent min-h-[90px] resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.contentIdeen.plattform}</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATTFORMEN.map(p => (
                <button key={p} type="button" onClick={() => toggleP(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    form.plattform.includes(p)
                      ? "bg-accent border-accent text-white"
                      : "bg-elevated border-divider text-muted hover:text-fg"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted block mb-1.5">{t.contentIdeen.contentTyp}</label>
              <select value={form.contentTyp} onChange={e => setForm(p => ({ ...p, contentTyp: e.target.value }))}
                className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent">
                <option value="">–</option>
                {CONTENT_TYPEN.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-1.5">{t.contentIdeen.gewuenschtesDatum}</label>
              <input type="date" value={form.gewuenschtesPostingDatum}
                onChange={e => setForm(p => ({ ...p, gewuenschtesPostingDatum: e.target.value }))}
                className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.contentIdeen.prioritaet}</label>
            <div className="flex gap-1.5">
              {([
                { wert: "Hoch",    label: t.contentIdeen.hoch,   cls: "bg-red-100 dark:bg-red-500/20 border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-300" },
                { wert: "Mittel",  label: t.contentIdeen.mittel, cls: "bg-yellow-100 dark:bg-yellow-500/20 border-yellow-300 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-300" },
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
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onSchliessen}
              className="flex-1 bg-elevated border border-divider text-fg text-sm rounded-xl py-2.5 hover:opacity-80 transition-opacity">
              {t.common.abbrechen}
            </button>
            <button type="submit" disabled={pending || !form.beschreibung.trim()}
              className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors">
              {pending ? t.contentIdeen.wirdEingereicht : t.contentIdeen.einreichen}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function useCountdown(zielzeit: Date | null): number | null {
  const [verbleibend, setVerbleibend] = useState<number | null>(null);

  useEffect(() => {
    if (!zielzeit) { setVerbleibend(null); return; }

    function berechnen() {
      const diff = Math.max(0, new Date(zielzeit!).getTime() - Date.now());
      setVerbleibend(diff);
      return diff;
    }

    const initial = berechnen();
    if (initial <= 0) return;

    const interval = setInterval(() => {
      const remaining = berechnen();
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [zielzeit]);

  return verbleibend;
}

export default function IdeenUndFreigabeTab({
  ideen: initialIdeen,
  kundenprofilId,
  postLimit = null,
  postLimits,
  onBearbeiten,
  limitGesperrtAb = null,
  onLimitChange,
}: {
  ideen: ContentIdea[];
  kundenprofilId: string;
  postLimit?: number | null;
  postLimits?: PostLimitsNachTyp;
  onBearbeiten?: (idee: FreigabeIdee) => void;
  limitGesperrtAb?: Date | null;
  onLimitChange?: (wert: Date | null) => void;
}) {
  const t = useT();
  const [lokalGesperrtAb, setLokalGesperrtAb] = useState<Date | null>(
    limitGesperrtAb ? new Date(limitGesperrtAb) : null
  );

  const verbleibendMs = useCountdown(lokalGesperrtAb);
  const gesperrt = lokalGesperrtAb !== null && (verbleibendMs === null || verbleibendMs <= 0);

  const [ansicht, setAnsicht] = useState<"ideen" | "freigabe">(() => {
    if (typeof window !== "undefined") {
      const g = localStorage.getItem("kunde_content_ansicht");
      if (g === "ideen" || g === "freigabe") return g;
    }
    return "ideen";
  });
  const [formOffen, setFormOffen] = useState(false);

  // ── Gemeinsamer State für beide Ansichten ─────────────────────
  const [ideen, setIdeen] = useState<ContentIdea[]>(initialIdeen);

  useEffect(() => {
    setIdeen(prev => prev.filter(i => initialIdeen.some(j => j.id === i.id)));
  }, [initialIdeen]);

  async function statusAendern(id: string, neuerStatus: string, kommentar?: string) {
    const backup = ideen;
    setIdeen(prev => prev.map(i => i.id === id ? { ...i, status: neuerStatus } : i));

    const res = await fetch(`/api/ideen/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: neuerStatus }),
    });

    if (!res.ok) {
      setIdeen(backup);
      return;
    }

    const data = await res.json();
    if (data.limitGesperrtAb !== undefined) {
      const neuerWert = data.limitGesperrtAb ? new Date(data.limitGesperrtAb) : null;
      setLokalGesperrtAb(neuerWert);
      onLimitChange?.(neuerWert);
    }

    if (kommentar?.trim()) {
      const kRes = await fetch(`/api/ideen/${id}/kommentare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: kommentar }),
      });
      if (kRes.ok) {
        const k = await kRes.json();
        const neuerKommentar: Kommentar = { ...k, createdAt: new Date(k.createdAt) };
        setIdeen(prev => prev.map(i => i.id === id
          ? { ...i, kommentare: [...i.kommentare, neuerKommentar] }
          : i));
      }
    }
  }

  function ideaAktualisieren(id: string, aenderungen: Partial<ContentIdea>) {
    setIdeen(prev => prev.map(i => i.id === id ? { ...i, ...aenderungen } : i));
  }

  function kommentarHinzufuegen(ideaId: string, kommentar: Kommentar) {
    setIdeen(prev => prev.map(i => i.id === ideaId
      ? { ...i, kommentare: [...i.kommentare, kommentar] }
      : i));
  }

  function ideaHinzufuegen(neueIdee: ContentIdea) {
    setIdeen(prev => [neueIdee, ...prev]);
  }

  // ──────────────────────────────────────────────────────────────

  function ansichtWechseln(a: "ideen" | "freigabe") {
    setAnsicht(a);
    localStorage.setItem("kunde_content_ansicht", a);
  }

  const offeneAnzahl = ideen.filter(i => (i.status || "Offen") === "Offen").length;

  const freigabeIdeen: FreigabeIdee[] = ideen.map(i => ({
    id: i.id,
    titel: i.titel,
    beschreibung: i.beschreibung,
    plattform: i.plattform,
    contentTyp: i.contentTyp,
    captionText: i.captionText,
    dateizugriff: i.dateizugriff,
    notizen: i.notizen,
    gewuenschtesPostingDatum: i.gewuenschtesPostingDatum,
    status: i.status,
    eingereichtVon: i.eingereichtVon,
    prioritaet: i.prioritaet,
    kommentare: i.kommentare,
  }));

  const minutenVerbleibend = verbleibendMs !== null ? Math.floor(verbleibendMs / 60000) : 0;
  const sekundenVerbleibend = verbleibendMs !== null ? Math.floor((verbleibendMs % 60000) / 1000) : 0;

  return (
    <div>
      {gesperrt && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
          <span className="text-red-500 text-lg leading-none mt-0.5">🔒</span>
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {t.contentIdeen.bereichGesperrt}
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">
              {t.contentIdeen.agenturKontakt}
            </p>
          </div>
        </div>
      )}
      {!gesperrt && lokalGesperrtAb && verbleibendMs !== null && verbleibendMs > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-orange-300 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-500/10 px-4 py-3">
          <span className="text-orange-500 text-lg leading-none mt-0.5">⏱</span>
          <div>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {t.contentIdeen.limitCountdown} {minutenVerbleibend}:{sekundenVerbleibend.toString().padStart(2, "0")} {t.contentIdeen.limitCountdownMin}
            </p>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/70 mt-0.5">
              {t.contentIdeen.limitWarnung}
            </p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-1 bg-elevated border border-divider rounded-xl p-1 btn-group">
          <button
            onClick={() => ansichtWechseln("ideen")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              ansicht === "ideen" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            {t.contentIdeen.kanban}
          </button>
          <button
            onClick={() => ansichtWechseln("freigabe")}
            className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              ansicht === "freigabe" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            {t.contentIdeen.freigabe}
            {offeneAnzahl > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs bg-accent text-white rounded-full">
                {offeneAnzahl}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => !gesperrt && setFormOffen(true)}
          disabled={gesperrt}
          className="flex items-center gap-1.5 text-sm text-accent border border-accent/30 hover:border-accent hover:bg-accent/5 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-base leading-none">+</span> {t.contentIdeen.eigeneIdee}
        </button>
      </div>

      <div className={ansicht === "ideen" ? "" : "hidden"}>
        <ContentIdeenTab
          ideen={ideen}
          kundenprofilId={kundenprofilId}
          postLimit={postLimit}
          postLimits={postLimits}
          onStatusChange={statusAendern}
          onIdeaUpdate={ideaAktualisieren}
          onKommentarAdded={kommentarHinzufuegen}
          gesperrt={gesperrt}
        />
      </div>
      <div className={ansicht === "freigabe" ? "" : "hidden"}>
        <FreigabeListeAnsicht
          ideen={freigabeIdeen}
          kundenprofilId={kundenprofilId}
          postLimit={postLimit}
          postLimits={postLimits}
          onBearbeiten={onBearbeiten}
          onStatusChange={statusAendern}
          gesperrt={gesperrt}
        />
      </div>

      {formOffen && (
        <IdeaEinreichenModal
          kundenprofilId={kundenprofilId}
          onErfolg={ideaHinzufuegen}
          onSchliessen={() => setFormOffen(false)}
        />
      )}
    </div>
  );
}

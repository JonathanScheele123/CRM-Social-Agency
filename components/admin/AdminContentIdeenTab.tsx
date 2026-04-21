"use client";

import { useState, useTransition } from "react";
import ContentIdeenModal from "./ContentIdeenModal";
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
  captionText: string | null;
  dateizugriff: string | null;
  gewuenschtesPostingDatum: Date | null;
  createdAt: Date;
  kommentare: Kommentar[];
};

const STATUS_FARBEN: Record<string, string> = {
  Offen:      "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30",
  Angenommen: "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30",
  Verworfen:  "bg-gray-100 dark:bg-gray-500/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-500/30",
};


const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

export default function AdminContentIdeenTab({
  ideen,
  kundenprofilId,
  vertraglichePostAnzahl,
  limitGesperrtAb = null,
  onEntsperre,
}: {
  ideen: ContentIdea[];
  kundenprofilId: string;
  vertraglichePostAnzahl?: number | null;
  limitGesperrtAb?: Date | null;
  onEntsperre?: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const STATUS_KEY = `admin_ideen_status_${kundenprofilId}`;
  const VON_KEY    = `admin_ideen_von_${kundenprofilId}`;
  const [statusFilter, setStatusFilter] = useState(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem(STATUS_KEY);
      if (v && ["alle", "Offen", "Angenommen", "Verworfen"].includes(v)) return v;
    }
    return "Angenommen";
  });
  const [vonFilter, setVonFilter] = useState(() => {
    if (typeof window !== "undefined") {
      const v = localStorage.getItem(VON_KEY);
      if (v && ["alle", "Agentur", "Kunde"].includes(v)) return v;
    }
    return "alle";
  });
  const [modalOffen, setModalOffen] = useState(false);
  const [ausgewaehlt, setAusgewaehlt] = useState<ContentIdea | null>(null);
  const [entsperrPending, startEntsperre] = useTransition();
  const [emailBestaetigung, setEmailBestaetigung] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [emailErgebnis, setEmailErgebnis] = useState<"ok" | "fehler" | null>(null);
  const [emailFehlerDetail, setEmailFehlerDetail] = useState<string | null>(null);

  async function emailSenden() {
    setEmailPending(true);
    setEmailErgebnis(null);
    setEmailFehlerDetail(null);
    try {
      const res = await fetch(`/api/admin/kunden/${kundenprofilId}/content-ideen-email`, { method: "POST" });
      if (res.ok) {
        setEmailErgebnis("ok");
      } else {
        const data = await res.json().catch(() => ({}));
        setEmailFehlerDetail(data.fehler ?? null);
        setEmailErgebnis("fehler");
      }
    } catch {
      setEmailErgebnis("fehler");
    } finally {
      setEmailPending(false);
      setEmailBestaetigung(false);
    }
  }

  function entsperren() {
    startEntsperre(async () => {
      const res = await fetch(`/api/admin/kunden/${kundenprofilId}/freigabe-entsperren`, { method: "POST" });
      if (res.ok) onEntsperre?.();
    });
  }

  const gefiltert = ideen.filter((i) => {
    const statusOk = statusFilter === "alle" || i.status === statusFilter;
    const vonOk = vonFilter === "alle" || i.eingereichtVon === vonFilter;
    return statusOk && vonOk;
  });

  const angenommen = ideen.filter((i) => i.status === "Angenommen").length;
  const vonKunde = ideen.filter((i) => i.eingereichtVon === "Kunde").length;

  return (
    <div>
      {vonKunde > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-700/40 rounded-xl px-3 py-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span className="text-blue-700 dark:text-blue-300">{vonKunde} neue {vonKunde === 1 ? "Idee" : "Ideen"} vom Kunden eingereicht</span>
        </div>
      )}

      {vertraglichePostAnzahl != null && (
        <div className={`flex items-center gap-2 mb-4 border rounded-xl px-3 py-2 text-sm ${
          angenommen >= vertraglichePostAnzahl
            ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-700/40"
            : "bg-elevated border-divider"
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${angenommen >= vertraglichePostAnzahl ? "bg-green-500" : "bg-yellow-400"}`} />
          <span className={angenommen >= vertraglichePostAnzahl ? "text-green-700 dark:text-green-300" : "text-muted"}>
            <span className="font-semibold">{angenommen}</span> von <span className="font-semibold">{vertraglichePostAnzahl}</span> vertraglich vereinbarten Posts angenommen
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex gap-1 btn-group">
          {["alle", "Offen", "Angenommen", "Verworfen"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); localStorage.setItem(STATUS_KEY, s); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                statusFilter === s ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"
              }`}
            >
              {s === "alle" ? t.common.alle : s === "Offen" ? t.contentIdeen.offen : s === "Angenommen" ? t.contentIdeen.angenommen : t.contentIdeen.verworfen}
            </button>
          ))}
        </div>
        <div className="flex gap-1 btn-group">
          {["alle", "Agentur", "Kunde"].map((v) => (
            <button
              key={v}
              onClick={() => { setVonFilter(v); localStorage.setItem(VON_KEY, v); }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                vonFilter === v ? "bg-violet-600 text-white" : "bg-elevated text-muted hover:text-fg"
              }`}
            >
              {v === "alle" ? t.common.alle : `${t.contentIdeen.eingereichtVon} ${v === "Agentur" ? t.contentIdeen.agenturLabel : t.contentIdeen.kundeLabel}`}
            </button>
          ))}
        </div>
        {limitGesperrtAb && (
          <button
            onClick={entsperren}
            disabled={entsperrPending}
            className="ml-auto text-sm px-3 py-1.5 rounded-lg border border-orange-300 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors disabled:opacity-50"
          >
            {entsperrPending ? "…" : t.contentIdeen.freigabeEntsperren}
          </button>
        )}
        <button
          onClick={() => { setEmailErgebnis(null); setEmailBestaetigung(true); }}
          className={`${limitGesperrtAb ? "" : "ml-auto "}text-sm px-3 py-1.5 rounded-lg border border-divider bg-elevated text-muted hover:text-fg transition-colors`}
        >
          {t.contentIdeen.emailSenden}
        </button>
        <button
          onClick={() => { setAusgewaehlt(null); setModalOffen(true); }}
          className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
        >
          + {lang === "de" ? "Idee" : "Idea"}
        </button>
      </div>

      {emailErgebnis === "ok" && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-700/40 rounded-xl px-3 py-2 text-sm text-green-700 dark:text-green-300">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          {t.contentIdeen.emailErfolg}
        </div>
      )}
      {emailErgebnis === "fehler" && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700/40 rounded-xl px-3 py-2 text-sm text-red-700 dark:text-red-300">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
          <span>{emailFehlerDetail ?? t.contentIdeen.emailFehler}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 card-group">
        {gefiltert.map((idee) => (
          <button
            key={idee.id}
            onClick={() => { setAusgewaehlt(idee); setModalOffen(true); }}
            className="bg-card border border-divider hover:border-muted/40 rounded-2xl p-4 text-left transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-medium text-sm line-clamp-2 flex-1 text-fg">
                {idee.titel ?? t.common.ohneTitle}
              </h3>
              {idee.status && (
                <span className={`text-xs px-2 py-0.5 rounded-lg border shrink-0 ${STATUS_FARBEN[idee.status] ?? ""}`}>
                  {idee.status}
                </span>
              )}
            </div>
            {idee.beschreibung && (
              <p className="text-muted text-xs line-clamp-2 mb-3">{idee.beschreibung}</p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {idee.plattform.map((p) => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>
                  {p}
                </span>
              ))}
              {idee.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-elevated text-muted">
                  {idee.contentTyp}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              {idee.eingereichtVon && (
                <p className="text-xs text-subtle">{t.contentIdeen.eingereichtVon} {idee.eingereichtVon}</p>
              )}
              {idee.gewuenschtesPostingDatum && (
                <p className="text-xs text-subtle">
                  {new Date(idee.gewuenschtesPostingDatum).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB")}
                </p>
              )}
            </div>
          </button>
        ))}

        {gefiltert.length === 0 && (
          <div className="col-span-3 text-center py-12 text-subtle">{t.contentIdeen.keineIdeen}</div>
        )}
      </div>

      {emailBestaetigung && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-divider rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-fg mb-2">{t.contentIdeen.emailBestaetigung}</h3>
            <p className="text-sm text-muted mb-5">{t.contentIdeen.emailText}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEmailBestaetigung(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted hover:text-fg transition-colors"
              >
                {t.common.abbrechen}
              </button>
              <button
                onClick={emailSenden}
                disabled={emailPending}
                className="px-4 py-2 rounded-lg text-sm bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50"
              >
                {emailPending ? t.common.wirdGesendet : t.contentIdeen.jetztSenden}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOffen && (
        <ContentIdeenModal
          kundenprofilId={kundenprofilId}
          idee={ausgewaehlt ?? undefined}
          onClose={() => { setModalOffen(false); setAusgewaehlt(null); }}
        />
      )}
    </div>
  );
}

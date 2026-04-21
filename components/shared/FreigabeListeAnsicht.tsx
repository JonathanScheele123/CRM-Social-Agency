"use client";

import { useState } from "react";
import DateizugriffVorschau from "@/components/shared/DateizugriffVorschau";
import { useT, useLang } from "@/lib/i18n";

type Kommentar = {
  id: string;
  text: string;
  autorTyp: string;
  autorName: string | null;
  createdAt: Date;
};

export type FreigabeIdee = {
  id: string;
  titel: string | null;
  beschreibung: string | null;
  plattform: string[];
  contentTyp: string | null;
  captionText: string | null;
  dateizugriff: string | null;
  notizen: string | null;
  gewuenschtesPostingDatum: Date | null;
  status: string | null;
  eingereichtVon: string | null;
  prioritaet: string | null;
  kommentare: Kommentar[];
};

export type PostLimitsNachTyp = {
  Reel: number | null;
  Story: number | null;
  Bild: number | null;
  Karussell: number | null;
};

const CONTENT_TYP_KEYS: (keyof PostLimitsNachTyp)[] = ["Reel", "Story", "Bild", "Karussell"];

const PLATTFORM_FARBEN: Record<string, string> = {
  Instagram: "bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300",
  Facebook:  "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300",
  TikTok:    "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  YouTube:   "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
  Sonstiges: "bg-gray-100 dark:bg-gray-600/20 text-gray-500 dark:text-gray-400",
};

function datumFormatieren(d: Date | null, locale: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function FreigabeKarte({
  idee,
  onStatusAendern,
  onBearbeiten,
  typLimitErreicht,
  pendingId,
  gesperrt = false,
}: {
  idee: FreigabeIdee;
  onStatusAendern: (id: string, status: string, kommentar?: string) => void;
  onBearbeiten?: (idee: FreigabeIdee) => void;
  typLimitErreicht: boolean;
  pendingId: string | null;
  gesperrt?: boolean;
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [offen, setOffen] = useState(false);
  const [aktion, setAktion] = useState<"annehmen" | "verwerfen" | null>(null);
  const [kommentar, setKommentar] = useState("");
  const pending = pendingId === idee.id;

  function bestaetigen() {
    onStatusAendern(idee.id, aktion === "annehmen" ? "Angenommen" : "Verworfen", kommentar || undefined);
    setAktion(null);
    setKommentar("");
  }

  return (
    <div className={`rounded-2xl overflow-hidden transition-all shadow-sm border ${
      gesperrt
        ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700/50"
        : "bg-card border-divider"
    }`}>
      <button
        className="w-full text-left p-4 sm:p-5"
        onClick={() => { setAktion(null); setOffen(v => !v); }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                {t.contentIdeen.offen}
              </span>
            </div>
            <h3 className="font-semibold text-fg">
              {idee.titel ?? idee.beschreibung?.slice(0, 50) ?? t.common.ohneTitle}
            </h3>
            {idee.beschreibung && idee.titel && (
              <p className="text-muted text-sm mt-0.5 line-clamp-1">{idee.beschreibung}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            {datumFormatieren(idee.gewuenschtesPostingDatum, dateLocale) && (
              <p className="text-muted text-xs">{datumFormatieren(idee.gewuenschtesPostingDatum, dateLocale)}</p>
            )}
            <div className="flex gap-1 mt-1 flex-wrap justify-end">
              {idee.plattform.map(p => (
                <span key={p} className={`text-xs px-1.5 py-0.5 rounded-md ${PLATTFORM_FARBEN[p] ?? "bg-elevated text-muted"}`}>{p}</span>
              ))}
              {idee.contentTyp && (
                <span className="text-xs px-1.5 py-0.5 rounded-md bg-elevated text-muted">{idee.contentTyp}</span>
              )}
            </div>
            {idee.eingereichtVon === "Kunde" && (
              <span className="mt-1.5 inline-block text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">
                {t.contentIdeen.vonKunde}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end mt-2">
          <span className="text-xs text-subtle">{offen ? `${t.common.weniger} ▲` : `${t.common.details} ▼`}</span>
        </div>
      </button>

      {offen && (
        <div className="px-4 sm:px-5 pb-5 space-y-3 border-t border-divider pt-4">
          {idee.beschreibung && (
            <div>
              <p className="text-xs text-subtle mb-1 uppercase tracking-wide font-medium">{t.contentIdeen.beschreibungLabel}</p>
              <p className="text-sm text-fg">{idee.beschreibung}</p>
            </div>
          )}
          {idee.captionText && (
            <div>
              <p className="text-xs text-subtle mb-1 uppercase tracking-wide font-medium">{t.contentIdeen.caption}</p>
              <div className="bg-elevated rounded-xl p-3 text-sm text-fg whitespace-pre-wrap leading-relaxed">
                {idee.captionText}
              </div>
            </div>
          )}
          {idee.notizen && (
            <div>
              <p className="text-xs text-subtle mb-1 uppercase tracking-wide font-medium">{t.contentIdeen.agenturNotizen}</p>
              <p className="text-sm text-muted">{idee.notizen}</p>
            </div>
          )}
          {idee.dateizugriff && (
            <DateizugriffVorschau url={idee.dateizugriff} />
          )}
          {idee.kommentare.length > 0 && (
            <div>
              <p className="text-xs text-subtle mb-2 uppercase tracking-wide font-medium">{t.contentIdeen.kommentare} ({idee.kommentare.length})</p>
              <div className="space-y-2">
                {idee.kommentare.map(k => (
                  <div key={k.id} className={`rounded-xl px-3 py-2 text-xs ${
                    k.autorTyp === "Agentur"
                      ? "bg-accent/5 border border-accent/20 text-fg"
                      : "bg-elevated border border-divider text-fg"
                  }`}>
                    <span className={`font-medium ${k.autorTyp === "Agentur" ? "text-accent" : "text-fg"}`}>
                      {k.autorTyp === "Agentur" ? t.contentIdeen.agenturLabel : (k.autorName ?? t.contentIdeen.kundeLabel)}
                    </span>
                    <span className="text-subtle mx-1">·</span>
                    <span className="text-subtle">{new Date(k.createdAt).toLocaleDateString(dateLocale)}</span>
                    <p className="mt-1 text-fg whitespace-pre-wrap">{k.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aktions-Buttons */}
      <div className="px-4 sm:px-5 pb-4">
        {aktion ? (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              {aktion === "annehmen" ? t.contentIdeen.kommentarAnnehmen : t.contentIdeen.grundAblehnen}
            </p>
            <textarea
              value={kommentar}
              onChange={e => setKommentar(e.target.value)}
              placeholder={t.contentIdeen.kommentarPlaceholder}
              autoFocus
              className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent min-h-[64px] resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => { setAktion(null); setKommentar(""); }}
                className="flex-1 text-sm py-2 rounded-xl bg-elevated text-muted border border-divider hover:text-fg transition-colors">
                {t.common.abbrechen}
              </button>
              <button onClick={bestaetigen} disabled={pending}
                className={`flex-1 text-sm py-2 rounded-xl text-white font-medium transition-colors disabled:opacity-40 ${
                  aktion === "annehmen" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"
                }`}>
                {pending ? "..." : aktion === "annehmen" ? t.contentIdeen.bestaetigen : t.contentIdeen.verwerfen2}
              </button>
            </div>
          </div>
        ) : gesperrt ? null : (
          <div className="flex gap-2">
            <button
              disabled={pending || typLimitErreicht}
              onClick={() => setAktion("annehmen")}
              title={typLimitErreicht ? t.contentIdeen.limitTooltip : undefined}
              className="flex-1 text-sm py-2 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.contentIdeen.annehmen}
            </button>
            <button
              disabled={pending}
              onClick={() => setAktion("verwerfen")}
              className="flex-1 text-sm py-2 rounded-xl bg-elevated text-muted hover:text-red-600 dark:hover:text-red-400 border border-divider transition-colors disabled:opacity-40"
            >
              {t.contentIdeen.verwerfen2}
            </button>
            {onBearbeiten && (
              <button
                onClick={() => onBearbeiten(idee)}
                className="text-sm px-3 py-2 rounded-xl bg-elevated text-muted hover:text-fg border border-divider transition-colors"
              >
                ✎
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FreigabeListeAnsicht({
  ideen,
  kundenprofilId,
  postLimit = null,
  postLimits,
  onBearbeiten,
  onStatusChange,
  gesperrt = false,
}: {
  ideen: FreigabeIdee[];
  kundenprofilId: string;
  postLimit?: number | null;
  postLimits?: PostLimitsNachTyp;
  onBearbeiten?: (idee: FreigabeIdee) => void;
  onStatusChange: (id: string, neuerStatus: string, kommentar?: string) => Promise<void>;
  gesperrt?: boolean;
}) {
  const t = useT();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const offene = ideen.filter(i => (i.status || "Offen") === "Offen");
  const angenommen = ideen.filter(i => i.status === "Angenommen");

  // Per-Typ Zähler für bereits angenommene Beiträge
  const angenommenProTyp: Record<string, number> = {};
  for (const idee of angenommen) {
    const typ = idee.contentTyp ?? "Sonstiges";
    angenommenProTyp[typ] = (angenommenProTyp[typ] ?? 0) + 1;
  }

  // Ob ein bestimmter Typ sein Limit erreicht hat (oder das Gesamtlimit)
  function istTypLimitErreicht(contentTyp: string | null): boolean {
    // Gesamtlimit ist immer ein harter Cap
    if (postLimit !== null && angenommen.length >= postLimit) return true;
    if (hatTypLimits && postLimits) {
      const typ = contentTyp as keyof PostLimitsNachTyp | null;
      if (!typ || !(typ in postLimits)) return true;
      const limit = postLimits[typ as keyof PostLimitsNachTyp];
      if (limit === null || limit === undefined) return true;
      return (angenommenProTyp[typ] ?? 0) >= limit;
    }
    return false;
  }

  // Gesamtlimit (Summe aller Typ-Limits oder postLimit)
  const gesamtLimit = postLimits
    ? CONTENT_TYP_KEYS.reduce<number | null>((sum, k) => {
        const v = postLimits[k];
        if (v === null || v === undefined) return sum;
        return (sum ?? 0) + v;
      }, null)
    : postLimit;

  // Banner: welche Typen haben ein Limit
  const typMitLimit = postLimits
    ? CONTENT_TYP_KEYS.filter(k => postLimits[k] !== null && postLimits[k] !== undefined && (postLimits[k] ?? 0) > 0)
    : [];
  const hatTypLimits = typMitLimit.length > 0;

  async function handleStatusAendern(id: string, neuerStatus: string, kommentar?: string) {
    setPendingId(id);
    await onStatusChange(id, neuerStatus, kommentar);
    setPendingId(null);
  }

  const zeigeGesamtBanner = postLimit !== null;
  const gesamtLimitErreicht = postLimit !== null && angenommen.length >= postLimit;

  return (
    <div>
      {/* Gesamtlimit-Banner – immer oben wenn postLimit gesetzt */}
      {zeigeGesamtBanner && (
        <div className={`mb-3 px-4 py-3 rounded-xl text-sm flex items-center gap-2 border ${
          gesperrt
            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300"
            : gesamtLimitErreicht
            ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700/50 text-orange-700 dark:text-orange-300"
            : "bg-elevated border-divider text-muted"
        }`}>
          <span>{angenommen.length} / {postLimit} {t.contentIdeen.beitraegeFreigegeben}</span>
          {gesperrt && <span className="font-medium ml-1">— {t.contentIdeen.keineWeiterenFreigaben}</span>}
          {!gesperrt && gesamtLimitErreicht && <span className="font-medium ml-1">— {t.contentIdeen.gesamtlimitErreicht}</span>}
        </div>
      )}

      {/* Typ-Limit-Banner */}
      {hatTypLimits && (
        <div className="mb-5 rounded-xl border border-divider bg-elevated overflow-hidden">
          <div className="px-4 py-2.5 border-b border-divider">
            <p className="text-xs font-semibold text-subtle uppercase tracking-wide">{t.contentIdeen.monatlichesLimit}</p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-x-4 gap-y-2">
            {typMitLimit.map(typ => {
              const limit = postLimits![typ] ?? 0;
              const count = angenommenProTyp[typ] ?? 0;
              const voll = count >= limit;
              return (
                <div key={typ} className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${voll ? "text-orange-600 dark:text-orange-400" : "text-fg"}`}>
                    {typ}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
                    voll
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                      : "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  }`}>
                    {count}/{limit}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Hinweis bei erreichten Limits */}
          {gesperrt ? (
            <div className="px-4 pb-3 pt-1 text-xs text-red-700 dark:text-red-300 font-medium">
              {t.contentIdeen.keineWeiterenFreigaben}
            </div>
          ) : typMitLimit.some(typ => (angenommenProTyp[typ] ?? 0) >= (postLimits![typ] ?? 0)) && (() => {
            const volleTypen = typMitLimit.filter(typ => (angenommenProTyp[typ] ?? 0) >= (postLimits![typ] ?? 0));
            const offeneTypen = typMitLimit.filter(typ => (angenommenProTyp[typ] ?? 0) < (postLimits![typ] ?? 0));
            return (
              <div className="px-4 pb-3 pt-1 text-xs text-orange-700 dark:text-orange-300">
                <span className="font-medium">{volleTypen.join(", ")}-{t.contentIdeen.limitErreicht}</span>
                {offeneTypen.length > 0 && (
                  <span className="text-muted ml-1">
                    {t.contentIdeen.nochMoeglich} {offeneTypen.map(typ => `${(postLimits![typ] ?? 0) - (angenommenProTyp[typ] ?? 0)} ${typ}`).join(", ")}.
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="space-y-3 card-group">
        {offene.map(idee => (
          <FreigabeKarte
            key={idee.id}
            idee={idee}
            onStatusAendern={handleStatusAendern}
            onBearbeiten={onBearbeiten}
            typLimitErreicht={istTypLimitErreicht(idee.contentTyp)}
            pendingId={pendingId}
            gesperrt={gesperrt}
          />
        ))}
        {offene.length === 0 && (
          <div className="text-center py-14 text-subtle">
            <p className="text-base mb-1">{t.contentIdeen.keineOffenenTitel}</p>
            <p className="text-sm">{t.contentIdeen.keineOffenen}</p>
          </div>
        )}
      </div>
    </div>
  );
}

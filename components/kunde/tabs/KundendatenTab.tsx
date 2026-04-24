"use client";

import { useState } from "react";
import ModalPortal from "@/components/ModalPortal";
import KundenprofilSektionen, { KundenprofilFelder } from "@/components/shared/KundenprofilSektionen";
import { useT, useLang } from "@/lib/i18n";

type Kundendaten = {
  id: string;
  beschreibung: string | null;
  inhalt: string | null;
  tags: string[];
  datum: Date | null;
  veraltet: boolean;
  hinzugefuegtVon: string | null;
};

const TAG_FARBEN: Record<string, string> = {
  Zielgruppe: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  "Allgemeine Informationen": "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-300",
  Drehtag: "bg-gray-100 dark:bg-gray-700/40 text-gray-600 dark:text-gray-300",
  Produkte: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  "Auftreten des Betriebes": "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300",
  "Wünsche des Kunden": "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300",
  "Events/Termine": "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300",
  Zusatzinformationen: "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300",
};

const BEREICHE = [
  "Zielgruppe",
  "Allgemeine Informationen",
  "Produkte",
  "Auftreten des Betriebes",
  "Wünsche des Kunden",
  "Events/Termine",
  "Drehtag",
  "Zusatzinformationen",
];

function HinzufuegenModal({
  kundenprofilId,
  onErfolg,
  onSchliessen,
}: {
  kundenprofilId: string;
  onErfolg: (eintrag: Kundendaten) => void;
  onSchliessen: () => void;
}) {
  const t = useT();
  const [beschreibung, setBeschreibung] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [bereich, setBereich] = useState("");
  const [pending, setPending] = useState(false);
  const [fehler, setFehler] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bereich) { setFehler(t.kundendatenTab.bereichFehler); return; }
    setPending(true);
    setFehler("");
    const res = await fetch("/api/kundendaten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kundenprofilId, beschreibung, inhalt, tags: [bereich] }),
    });
    setPending(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setFehler(d.fehler || t.kundendatenTab.fehlerSpeichern);
      return;
    }
    const data = await res.json();
    onErfolg({ id: data.id, beschreibung, inhalt: inhalt || null, tags: [bereich], datum: new Date(), veraltet: false, hinzugefuegtVon: "Kunde" });
    onSchliessen();
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={onSchliessen}>
      <div className="glass-modal rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-fg">{t.kundendatenTab.eintragHinzufuegen}</h3>
          <button onClick={onSchliessen} className="text-muted hover:text-fg transition-colors">✕</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.kundendatenTab.bereich}</label>
            <div className="flex flex-wrap gap-2">
              {BEREICHE.map(b => (
                <button key={b} type="button" onClick={() => setBereich(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${bereich === b ? "bg-accent border-accent text-white" : "bg-elevated border-divider text-muted hover:text-fg"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.kundendatenTab.titelBeschreibung}</label>
            <input required value={beschreibung} onChange={e => setBeschreibung(e.target.value)}
              className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2 text-sm placeholder:text-subtle focus:outline-none focus:border-accent"
              placeholder={t.kundendatenTab.titelPlaceholder} />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1.5">{t.kundendatenTab.details}</label>
            <textarea value={inhalt} onChange={e => setInhalt(e.target.value)}
              className="w-full bg-elevated border border-divider text-fg rounded-xl px-3 py-2.5 text-sm placeholder:text-subtle focus:outline-none focus:border-accent resize-none min-h-[80px]"
              placeholder={t.kundendatenTab.detailsPlaceholder} />
          </div>
          {fehler && <p className="text-red-500 text-xs">{fehler}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onSchliessen}
              className="flex-1 bg-elevated border border-divider text-fg text-sm rounded-xl py-2.5 hover:opacity-80 transition-opacity">
              {t.common.abbrechen}
            </button>
            <button type="submit" disabled={pending || !beschreibung.trim() || !bereich}
              className="flex-1 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-xl py-2.5 transition-colors">
              {pending ? t.common.speichert : t.common.hinzufuegen}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  );
}

export default function KundendatenTab({
  daten: initialDaten,
  kundenprofilId,
  profil,
}: {
  daten: Kundendaten[];
  kundenprofilId?: string;
  profil?: KundenprofilFelder;
}) {
  const t = useT();
  const { lang } = useLang();
  const [ansicht, setAnsicht] = useState<"profil" | "notizen">("profil");
  const [tagFilter, setTagFilter] = useState<string>("alle");
  const [ausgewaehlt, setAusgewaehlt] = useState<Kundendaten | null>(null);
  const [neueDaten, setNeueDaten] = useState<Kundendaten[]>([]);
  const [modalOffen, setModalOffen] = useState(false);

  const daten = [...neueDaten, ...initialDaten];

  const alleTags = Array.from(new Set(daten.flatMap((d) => d.tags)));
  const gefiltert = daten.filter((d) => {
    if (d.veraltet) return false;
    if (tagFilter === "alle") return true;
    return d.tags.includes(tagFilter);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-elevated border border-divider rounded-xl p-1 btn-group">
          <button
            onClick={() => setAnsicht("profil")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${ansicht === "profil" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"}`}
          >
            {t.kundendatenTab.kundenprofil}
          </button>
          <button
            onClick={() => setAnsicht("notizen")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${ansicht === "notizen" ? "bg-card text-fg shadow-sm" : "text-muted hover:text-fg"}`}
          >
            {t.kundendatenTab.notizen}
          </button>
        </div>
        {ansicht === "notizen" && kundenprofilId && (
          <button
            onClick={() => setModalOffen(true)}
            className="bg-accent hover:bg-accent-hover text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
          >
            {t.kundendatenTab.hinzufuegen}
          </button>
        )}
      </div>

      {ansicht === "profil" && profil && <KundenprofilSektionen profil={profil} kundenAnsicht />}
      {ansicht === "profil" && !profil && <p className="text-subtle text-sm">{t.kundendatenTab.keineProfilDaten}</p>}

      {ansicht === "notizen" && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setTagFilter("alle")}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tagFilter === "alle" ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"}`}
            >
              {t.common.alle}
            </button>
            {alleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${tagFilter === tag ? "bg-accent text-white" : "bg-elevated text-muted hover:text-fg"}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {gefiltert.map((datensatz) => (
              <button
                key={datensatz.id}
                onClick={() => setAusgewaehlt(datensatz)}
                className="w-full text-left bg-card border border-divider hover:border-muted/40 rounded-2xl p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-fg">{datensatz.beschreibung ?? "–"}</p>
                    {datensatz.inhalt && (
                      <p className="text-muted text-xs mt-1 line-clamp-2">{datensatz.inhalt}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {datensatz.datum && (
                      <p className="text-subtle text-xs">{new Date(datensatz.datum).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB")}</p>
                    )}
                    <div className="flex gap-1 flex-wrap justify-end">
                      {datensatz.tags.map((tag) => (
                        <span key={tag} className={`text-xs px-1.5 py-0.5 rounded-md ${TAG_FARBEN[tag] ?? "bg-elevated text-muted"}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            {gefiltert.length === 0 && (
              <div className="text-center py-12 text-subtle">{t.kundendatenTab.keineEintraege}</div>
            )}
          </div>
        </>
      )}

      {ausgewaehlt && (
        <ModalPortal>
        <div className="fixed inset-0 glass-overlay z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setAusgewaehlt(null)}>
          <div className="glass-modal rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-fg">{ausgewaehlt.beschreibung ?? "–"}</h3>
              <button onClick={() => setAusgewaehlt(null)} className="text-muted hover:text-fg ml-3 transition-colors">✕</button>
            </div>
            {ausgewaehlt.inhalt && (
              <p className="text-fg text-sm whitespace-pre-wrap">{ausgewaehlt.inhalt}</p>
            )}
          </div>
        </div>
        </ModalPortal>
      )}

      {modalOffen && kundenprofilId && (
        <HinzufuegenModal
          kundenprofilId={kundenprofilId}
          onErfolg={eintrag => setNeueDaten(prev => [eintrag, ...prev])}
          onSchliessen={() => setModalOffen(false)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/components/ModalPortal";

type DrehtagInfo = {
  drehtag: Date | null;
  drehtageAdresse: string | null;
  drehtageStatus: string | null;
};

export default function DrehtagModal({
  kundenprofilId,
  aktuell,
  onClose,
}: {
  kundenprofilId: string;
  aktuell: DrehtagInfo;
  onClose: () => void;
}) {
  const router = useRouter();
  const hatAktivenDrehtag = aktuell.drehtag && aktuell.drehtageStatus === "geplant";

  const [datum, setDatum] = useState<string>(() => {
    if (hatAktivenDrehtag && aktuell.drehtag) {
      const d = new Date(aktuell.drehtag);
      return d.toISOString().substring(0, 10);
    }
    return "";
  });
  const [uhrzeit, setUhrzeit] = useState<string>(() => {
    if (hatAktivenDrehtag && aktuell.drehtag) {
      const d = new Date(aktuell.drehtag);
      return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return "09:00";
  });
  const [adresse, setAdresse] = useState(aktuell.drehtageAdresse ?? "");
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [bestaetigt, setBestaetigt] = useState(false);
  const [absageBestaetigung, setAbsageBestaetigung] = useState(false);

  async function speichern() {
    if (!datum || !uhrzeit || !adresse.trim()) {
      setFehler("Bitte alle Felder ausfüllen.");
      return;
    }
    setLaden(true);
    setFehler("");
    try {
      const res = await fetch(`/api/admin/kunden/${kundenprofilId}/drehtag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datum, uhrzeit, adresse: adresse.trim() }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json"))
        throw new Error(`Serverfehler (${res.status}) — bitte Seite neu laden.`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler ?? "Fehler beim Speichern.");
      setBestaetigt(true);
      router.refresh();
      setTimeout(onClose, 2000);
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLaden(false);
    }
  }

  async function absagen() {
    setLaden(true);
    setFehler("");
    try {
      const res = await fetch(`/api/admin/kunden/${kundenprofilId}/drehtag`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.fehler ?? "Fehler beim Absagen.");
      router.refresh();
      onClose();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLaden(false);
    }
  }

  if (bestaetigt) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-divider rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-fg font-semibold text-lg mb-1">Drehtag gespeichert</p>
            <p className="text-muted text-sm">E-Mail wurde an alle Kunden-Nutzer gesendet.</p>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card border border-divider rounded-2xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>

          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-divider">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-0.5">Drehtag</p>
              <h2 className="text-lg font-bold text-fg">
                {hatAktivenDrehtag ? "Drehtag bearbeiten" : "Drehtag planen"}
              </h2>
            </div>
            <button onClick={onClose} className="text-muted hover:text-fg transition-colors p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">

            {hatAktivenDrehtag && aktuell.drehtag && (
              <div className="bg-accent/8 border border-accent/20 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">Aktuell geplant</p>
                <p className="text-sm font-medium text-fg">
                  {new Date(aktuell.drehtag).toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}&nbsp;·&nbsp;
                  {new Date(aktuell.drehtag).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} Uhr
                </p>
                {aktuell.drehtageAdresse && <p className="text-xs text-muted mt-0.5">{aktuell.drehtageAdresse}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Datum</label>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                min={new Date().toISOString().substring(0, 10)}
                className="w-full bg-elevated border border-divider rounded-xl px-4 py-2.5 text-sm text-fg focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Uhrzeit</label>
              <input
                type="time"
                value={uhrzeit}
                onChange={(e) => setUhrzeit(e.target.value)}
                className="w-full bg-elevated border border-divider rounded-xl px-4 py-2.5 text-sm text-fg focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Treffpunkt / Adresse</label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="z. B. Musterstraße 12, 01234 Dresden"
                className="w-full bg-elevated border border-divider rounded-xl px-4 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {fehler && <p className="text-red-500 text-sm">{fehler}</p>}

            <div className="bg-elevated border border-divider rounded-xl px-4 py-3">
              <p className="text-xs text-muted leading-relaxed">
                Nach dem Speichern wird automatisch eine Bestätigungs-E-Mail an alle Nutzer des Kundeninterfaces gesendet.
                Erinnerungen folgen 1 Tag und 1 Stunde vor dem Termin.
              </p>
            </div>
          </div>

          <div className="px-6 pb-5 flex flex-col gap-2">
            <button
              onClick={speichern}
              disabled={laden}
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-50"
            >
              {laden ? "Wird gesendet…" : hatAktivenDrehtag ? "Termin aktualisieren & E-Mail senden" : "Drehtag planen & E-Mail senden"}
            </button>

            {hatAktivenDrehtag && (
              absageBestaetigung ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAbsageBestaetigung(false)}
                    className="flex-1 bg-elevated border border-divider text-fg font-medium text-sm rounded-xl py-2.5 transition-colors"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={absagen}
                    disabled={laden}
                    className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 font-semibold text-sm rounded-xl py-2.5 transition-colors disabled:opacity-50"
                  >
                    {laden ? "Wird abgesagt…" : "Ja, Drehtag absagen"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAbsageBestaetigung(true)}
                  className="w-full bg-transparent border border-divider hover:border-red-500/40 text-muted hover:text-red-500 font-medium text-sm rounded-xl py-2.5 transition-colors"
                >
                  Drehtag absagen
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

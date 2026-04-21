"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Vorlage = {
  id: string;
  name: string;
  beschreibung: string | null;
  betreff: string;
  html: string;
  createdAt: Date;
};

type FormState = { name: string; beschreibung: string; betreff: string; html: string };
const LEER: FormState = { name: "", beschreibung: "", betreff: "", html: "" };

function VorlagenModal({
  initial,
  onSpeichern,
  onClose,
}: {
  initial?: Vorlage | null;
  onSpeichern: (data: FormState) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? { name: initial.name, beschreibung: initial.beschreibung ?? "", betreff: initial.betreff, html: initial.html }
      : LEER
  );
  const [speichern, setSpeichern] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [vorschau, setVorschau] = useState(false);

  function set(k: keyof FormState, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function submit() {
    if (!form.name || !form.betreff) { setFehler("Name und Betreff sind Pflichtfelder."); return; }
    setSpeichern(true);
    setFehler(null);
    try {
      await onSpeichern(form);
      onClose();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Speichern.");
    } finally {
      setSpeichern(false);
    }
  }

  function htmlDateiLaden(e: React.ChangeEvent<HTMLInputElement>) {
    const datei = e.target.files?.[0];
    if (!datei) return;
    const reader = new FileReader();
    reader.onload = ev => set("html", (ev.target?.result as string) ?? "");
    reader.readAsText(datei, "utf-8");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-card border border-divider rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-divider">
          <h2 className="font-semibold text-fg">{initial ? "Vorlage bearbeiten" : "Neue Vorlage"}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted">Name *</label>
              <input
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="z.B. Willkommen beim Onboarding"
                className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted">Beschreibung</label>
              <input
                value={form.beschreibung}
                onChange={e => set("beschreibung", e.target.value)}
                placeholder="Kurze Beschreibung (optional)"
                className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Betreff *</label>
            <input
              value={form.betreff}
              onChange={e => set("betreff", e.target.value)}
              placeholder="E-Mail-Betreff"
              className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted">HTML-Inhalt</label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-xs text-accent hover:underline">
                  .html importieren
                  <input type="file" accept=".html,.htm" className="hidden" onChange={htmlDateiLaden} />
                </label>
                <button
                  type="button"
                  onClick={() => setVorschau(v => !v)}
                  className="text-xs text-muted hover:text-fg transition-colors border border-divider rounded-lg px-2 py-0.5"
                >
                  {vorschau ? "Code" : "Vorschau"}
                </button>
              </div>
            </div>
            {vorschau ? (
              <div className="border border-divider rounded-xl overflow-hidden bg-white">
                <iframe
                  srcDoc={form.html || "<p style='color:#999;padding:16px'>Kein Inhalt</p>"}
                  className="w-full min-h-[300px] border-0"
                  sandbox="allow-same-origin"
                  title="Vorschau"
                />
              </div>
            ) : (
              <textarea
                value={form.html}
                onChange={e => set("html", e.target.value)}
                rows={10}
                placeholder="HTML-Code der E-Mail-Vorlage…"
                className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 font-mono resize-y"
              />
            )}
          </div>

          {fehler && <p className="text-sm text-red-600 dark:text-red-400">{fehler}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-muted hover:text-fg border border-divider hover:bg-elevated transition-colors">Abbrechen</button>
            <button onClick={submit} disabled={speichern} className="px-4 py-2 rounded-xl text-sm bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors">
              {speichern ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailVorlagenVerwaltung({ vorlagen: init }: { vorlagen: Vorlage[] }) {
  const router = useRouter();
  const [vorlagen, setVorlagen] = useState<Vorlage[]>(init);
  const [modal, setModal] = useState<{ mode: "neu" } | { mode: "edit"; vorlage: Vorlage } | null>(null);
  const [loeschen, setLoeschen] = useState<string | null>(null);

  async function speichern(data: FormState) {
    if (modal?.mode === "neu") {
      const res = await fetch("/api/email/vorlagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.fehler);
      setVorlagen(p => [d.vorlage, ...p]);
    } else if (modal?.mode === "edit") {
      const res = await fetch(`/api/email/vorlagen/${modal.vorlage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.fehler);
      setVorlagen(p => p.map(v => v.id === modal.vorlage.id ? d.vorlage : v));
    }
    router.refresh();
  }

  async function loeschenBestaetigt(id: string) {
    const res = await fetch(`/api/email/vorlagen/${id}`, { method: "DELETE" });
    if (res.ok) setVorlagen(p => p.filter(v => v.id !== id));
    setLoeschen(null);
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-fg">E-Mail-Vorlagen</h2>
          <p className="text-sm text-muted mt-0.5">HTML-Vorlagen für automatisierte E-Mails und Kundenanschreiben</p>
        </div>
        <button
          onClick={() => setModal({ mode: "neu" })}
          className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          + Neue Vorlage
        </button>
      </div>

      {vorlagen.length === 0 ? (
        <div className="bg-card border border-divider rounded-2xl px-6 py-10 text-center space-y-2">
          <p className="text-sm font-medium text-fg">Noch keine Vorlagen</p>
          <p className="text-xs text-muted">Erstelle deine erste HTML-E-Mail-Vorlage</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vorlagen.map(v => (
            <div key={v.id} className="bg-card border border-divider rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-fg">{v.name}</p>
                {v.beschreibung && <p className="text-xs text-muted">{v.beschreibung}</p>}
                <p className="text-xs text-subtle">Betreff: {v.betreff}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setModal({ mode: "edit", vorlage: v })}
                  className="p-2 rounded-lg text-muted hover:text-fg hover:bg-elevated transition-colors"
                  title="Bearbeiten"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => setLoeschen(v.id)}
                  className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Löschen"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <VorlagenModal
          initial={modal.mode === "edit" ? modal.vorlage : null}
          onSpeichern={speichern}
          onClose={() => setModal(null)}
        />
      )}

      {loeschen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-divider rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
            <p className="font-medium text-fg">Vorlage löschen?</p>
            <p className="text-sm text-muted">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setLoeschen(null)} className="px-4 py-2 rounded-xl text-sm border border-divider text-muted hover:text-fg hover:bg-elevated transition-colors">Abbrechen</button>
              <button onClick={() => loeschenBestaetigt(loeschen)} className="px-4 py-2 rounded-xl text-sm bg-red-600 text-white hover:bg-red-700 transition-colors">Löschen</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

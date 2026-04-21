"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const inputClass =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";
const labelClass = "block text-sm font-medium text-fg mb-1.5";

export default function FormularBearbeitenPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [name, setName] = useState("");
  const [introText, setIntroText] = useState("");
  const [laden, setLaden] = useState(false);
  const [speichern, setSpeichern] = useState(false);
  const [fehler, setFehler] = useState("");
  const [gespeichert, setGespeichert] = useState(false);
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    fetch(`/api/formular/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? "");
        setIntroText(data.introText ?? "");
        setLaden(false);
      })
      .catch(() => setFehler("Formular nicht gefunden."));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    setSpeichern(true);

    const res = await fetch(`/api/admin/formulare/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, introText }),
    });

    setSpeichern(false);

    if (res.ok) {
      setGespeichert(true);
      setTimeout(() => setGespeichert(false), 2500);
    } else {
      const data = await res.json().catch(() => ({}));
      setFehler(data.fehler || "Fehler beim Speichern.");
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/formular/${slug}`).then(() => {
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    });
  }

  if (laden) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-muted hover:text-fg text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Dashboard
        </button>

        <h1 className="text-fg text-2xl font-semibold tracking-tight mb-2">Formular bearbeiten</h1>
        <div className="flex items-center gap-3 mb-8">
          <span className="text-subtle text-sm">/formular/{slug}</span>
          <button
            onClick={copyLink}
            className="text-xs px-2.5 py-1 rounded-lg bg-elevated border border-divider text-muted hover:text-fg transition-colors"
          >
            {kopiert ? "Kopiert ✓" : "Link kopieren"}
          </button>
          <a
            href={`/formular/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-accent hover:underline"
          >
            Vorschau ↗
          </a>
        </div>

        <div className="glass-modal rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Formular-Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Einleitungstext (optional)</label>
              <textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                placeholder="Kurze Beschreibung für den Kunden."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            {fehler && (
              <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                {fehler}
              </p>
            )}

            <button
              type="submit"
              disabled={speichern}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              {speichern ? "Wird gespeichert..." : gespeichert ? "Gespeichert ✓" : "Änderungen speichern"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

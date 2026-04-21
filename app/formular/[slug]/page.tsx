"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface FormularConfig {
  id: string;
  name: string;
  introText?: string | null;
}

const inputClass =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors";
const labelClass = "block text-sm font-medium text-fg mb-1.5";

export default function FormularPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [config, setConfig] = useState<FormularConfig | null>(null);
  const [nichtGefunden, setNichtGefunden] = useState(false);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const [form, setForm] = useState({
    unternehmensname: "",
    ansprechpartner: "",
    ansprechpartnerRolle: "",
    geschaeftsadresse: "",
    email: "",
    telefonnummer: "",
    branche: "",
    webseite: "",
    socialMediaKanaele: "",
    freigabeVerantwortlicher: "",
    emailFreigabeVerantwortlicher: "",
    cloudLink: "",
    zusatzlinks: "",
  });

  useEffect(() => {
    fetch(`/api/formular/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNichtGefunden(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setConfig(data); })
      .catch(() => setNichtGefunden(true));
  }, [slug]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler("");

    const payload = {
      ...form,
      ansprechpartner: form.ansprechpartner
        ? `${form.ansprechpartner}${form.ansprechpartnerRolle ? ` (${form.ansprechpartnerRolle})` : ""}`
        : "",
    };

    const res = await fetch(`/api/formular/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLaden(false);

    if (res.ok) {
      router.push(`/formular/${slug}/danke`);
    } else {
      const data = await res.json().catch(() => ({}));
      setFehler(data.fehler || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  if (nichtGefunden) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-fg text-2xl font-semibold mb-2">Formular nicht gefunden</h1>
          <p className="text-muted text-sm">Dieser Link ist ungültig oder wurde deaktiviert.</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="JS Media" width={80} height={80} className="dark:hidden" />
            <img src="/logo-white.png" alt="JS Media" width={80} height={80} className="hidden dark:block" />
          </div>
          <h1 className="text-fg text-2xl font-semibold tracking-tight">{config.name}</h1>
          {config.introText && (
            <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">{config.introText}</p>
          )}
        </div>

        {/* Form Card */}
        <div className="glass-modal rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Unternehmen */}
            <div>
              <h2 className="text-fg text-base font-semibold mb-4 pb-2 border-b border-divider">
                Unternehmen
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Unternehmensname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.unternehmensname}
                    onChange={(e) => set("unternehmensname", e.target.value)}
                    placeholder="Musterfirma GmbH"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Ansprechpartner (Name)</label>
                    <input
                      type="text"
                      value={form.ansprechpartner}
                      onChange={(e) => set("ansprechpartner", e.target.value)}
                      placeholder="Max Mustermann"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Rolle / Position</label>
                    <input
                      type="text"
                      value={form.ansprechpartnerRolle}
                      onChange={(e) => set("ansprechpartnerRolle", e.target.value)}
                      placeholder="Geschäftsführer"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Geschäftsadresse</label>
                  <input
                    type="text"
                    value={form.geschaeftsadresse}
                    onChange={(e) => set("geschaeftsadresse", e.target.value)}
                    placeholder="Musterstraße 1, 12345 Musterstadt"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      E-Mail-Adresse <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="info@firma.de"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Telefonnummer</label>
                    <input
                      type="tel"
                      value={form.telefonnummer}
                      onChange={(e) => set("telefonnummer", e.target.value)}
                      placeholder="+49 123 456789"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Branche</label>
                    <input
                      type="text"
                      value={form.branche}
                      onChange={(e) => set("branche", e.target.value)}
                      placeholder="z. B. Gastronomie, Handwerk"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Webseite</label>
                    <input
                      type="url"
                      value={form.webseite}
                      onChange={(e) => set("webseite", e.target.value)}
                      placeholder="https://www.firma.de"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Social-Media-Kanäle</label>
                  <input
                    type="text"
                    value={form.socialMediaKanaele}
                    onChange={(e) => set("socialMediaKanaele", e.target.value)}
                    placeholder="Instagram, Facebook, LinkedIn, ..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Freigabe */}
            <div>
              <h2 className="text-fg text-base font-semibold mb-4 pb-2 border-b border-divider">
                Freigabe & Zugänge
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Freigabe-Verantwortlicher</label>
                    <input
                      type="text"
                      value={form.freigabeVerantwortlicher}
                      onChange={(e) => set("freigabeVerantwortlicher", e.target.value)}
                      placeholder="Name der Person"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>E-Mail Freigabe-Verantwortlicher</label>
                    <input
                      type="email"
                      value={form.emailFreigabeVerantwortlicher}
                      onChange={(e) => set("emailFreigabeVerantwortlicher", e.target.value)}
                      placeholder="freigabe@firma.de"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Cloud-Link (Medien / Dateien)</label>
                  <input
                    type="url"
                    value={form.cloudLink}
                    onChange={(e) => set("cloudLink", e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Zusatzlinks</label>
                  <input
                    type="text"
                    value={form.zusatzlinks}
                    onChange={(e) => set("zusatzlinks", e.target.value)}
                    placeholder="Weitere relevante Links"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {fehler && (
              <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                {fehler}
              </p>
            )}

            <button
              type="submit"
              disabled={laden}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-colors"
            >
              {laden ? "Wird gesendet..." : "Formular absenden"}
            </button>

            <p className="text-subtle text-xs text-center">
              Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Daten durch JS Media zu.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

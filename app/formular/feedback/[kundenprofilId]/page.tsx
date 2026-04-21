"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const textareaClass =
  "w-full bg-elevated border border-divider text-fg rounded-xl px-4 py-3 text-sm placeholder:text-subtle focus:outline-none focus:border-accent transition-colors resize-none min-h-[100px]";
const labelClass = "block text-sm font-medium text-fg mb-3";

const SKALA_FRAGEN = [
  { id: "q1",  text: "Wie zufrieden sind Sie insgesamt mit unserer Zusammenarbeit?" },
  { id: "q2",  text: "Wie froh sind Sie, dass wir Sie aktuell als Agentur begleiten?" },
  { id: "q3",  text: "Wie zufrieden sind Sie insgesamt mit unserer Dienstleistung?" },
  { id: "q4",  text: "Wie zufrieden sind Sie mit der Kommunikation und Abstimmung mit uns?" },
  { id: "q5",  text: "Wie zufrieden sind Sie mit unserer Zuverlässigkeit und der Umsetzung?" },
  { id: "q6",  text: "Wie zufrieden waren Sie mit dem Ablauf des Drehtags bzw. der Drehtage?" },
  { id: "q7",  text: "Wie professionell und angenehm war die Betreuung vor Ort für Sie?" },
  { id: "q8",  text: "Hatten Sie das Gefühl, dass Ihre Ziele aus Ihrer Sicht eingehalten bzw. erreicht wurden?" },
  { id: "q9",  text: "Wie zufrieden sind Sie mit unserem Contentfreigabe-Tool?" },
  { id: "q10", text: "Wie einfach ist für Sie die Nutzung unserer Bedienoberfläche?" },
  { id: "q11", text: "Wie zufrieden sind Sie mit der Freigabe und Abstimmung von Inhalten über unsere Kundenoberfläche?" },
];

const TEXT_FRAGEN = [
  { id: "q12", text: "Was gefällt Ihnen an unserer Zusammenarbeit aktuell am meisten?" },
  { id: "q13", text: "Was können wir an unserer Dienstleistung, der Kommunikation, dem Drehtag oder der Bedienoberfläche verbessern?" },
  { id: "q14", text: "Gibt es sonst noch etwas, das Sie uns mitgeben möchten?" },
];

function SkalaInput({
  frage,
  nr,
  value,
  onChange,
}: {
  frage: string;
  nr: number;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className={labelClass}>
        <span className="text-accent font-semibold mr-1.5">{nr}.</span>
        {frage}
      </label>
      <div className="flex gap-1.5 flex-wrap">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-colors ${
              value === n
                ? n >= 8
                  ? "bg-green-600 border-green-600 text-white"
                  : n >= 5
                  ? "bg-accent border-accent text-white"
                  : "bg-red-500 border-red-500 text-white"
                : "bg-elevated border-divider text-muted hover:text-fg hover:border-muted/40"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-1.5 px-0.5">
        <span className="text-xs text-subtle">Gar nicht</span>
        <span className="text-xs text-subtle">Sehr</span>
      </div>
    </div>
  );
}

export default function FeedbackFormularPage() {
  const params = useParams();
  const kundenprofilId = params.kundenprofilId as string;
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");

  const [skala, setSkala] = useState<Record<string, number | null>>(
    Object.fromEntries([...SKALA_FRAGEN].map(f => [f.id, null]))
  );
  const [texte, setTexte] = useState<Record<string, string>>(
    Object.fromEntries([...TEXT_FRAGEN].map(f => [f.id, ""]))
  );

  function setSkalawert(id: string, v: number) {
    setSkala(prev => ({ ...prev, [id]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    setLaden(true);

    const res = await fetch(`/api/formular/feedback/${kundenprofilId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skala, texte }),
    });

    setLaden(false);

    if (res.ok) {
      window.location.href = "https://g.page/r/CVSnpb5S3z22EAE/review";
    } else {
      const data = await res.json().catch(() => ({}));
      setFehler(data.fehler || "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="JS Media" width={80} height={80} className="dark:hidden" />
            <img src="/logo-white.png" alt="JS Media" width={80} height={80} className="hidden dark:block" />
          </div>
          <h1 className="text-fg text-2xl font-semibold tracking-tight">Kundenfeedback</h1>
          <p className="text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Vielen Dank, dass Sie sich kurz Zeit für ein Feedback nehmen.
            Ihre Rückmeldung hilft uns dabei, unsere Zusammenarbeit und unsere Dienstleistung weiter zu verbessern.
          </p>
        </div>

        <div className="glass-modal rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="space-y-7">
              {SKALA_FRAGEN.map((f, i) => (
                <SkalaInput
                  key={f.id}
                  frage={f.text}
                  nr={i + 1}
                  value={skala[f.id]}
                  onChange={v => setSkalawert(f.id, v)}
                />
              ))}
            </div>

            <div className="space-y-6 pt-2">
              {TEXT_FRAGEN.map((f, i) => (
                <div key={f.id}>
                  <label className={labelClass}>
                    <span className="text-accent font-semibold mr-1.5">{SKALA_FRAGEN.length + i + 1}.</span>
                    {f.text}
                  </label>
                  <textarea
                    value={texte[f.id]}
                    onChange={e => setTexte(prev => ({ ...prev, [f.id]: e.target.value }))}
                    placeholder="Ihre Antwort..."
                    className={textareaClass}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-divider space-y-4">
              <p className="text-sm text-muted leading-relaxed">
                Vielen Dank für Ihr Feedback.
              </p>
              <p className="text-sm text-muted leading-relaxed">
                Wenn Sie mit unserer Zusammenarbeit zufrieden sind, freuen wir uns sehr über eine Google-Bewertung. Sie werden nach dem Absenden direkt weitergeleitet.
              </p>
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
              {laden ? "Wird gesendet..." : "Feedback absenden & Google-Bewertung hinterlassen"}
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

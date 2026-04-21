import Link from "next/link";

export default function DankePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="JS Media" width={72} height={72} className="dark:hidden" />
          <img src="/logo-white.png" alt="JS Media" width={72} height={72} className="hidden dark:block" />
        </div>

        <div className="glass-modal rounded-2xl p-10">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-fg text-2xl font-semibold tracking-tight mb-3">
            Vielen Dank!
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-6">
            Ihre Angaben wurden erfolgreich übermittelt. Wir haben Ihnen Ihre Zugangsdaten per E-Mail zugesendet. Bitte überprüfen Sie Ihr Postfach.
          </p>
          <p className="text-subtle text-xs">
            Bei Fragen wenden Sie sich an{" "}
            <a href="mailto:kontakt@jonathanscheele.de" className="text-accent hover:underline">
              kontakt@jonathanscheele.de
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

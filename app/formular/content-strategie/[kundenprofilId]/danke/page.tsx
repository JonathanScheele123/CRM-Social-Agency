export default function ContentStrategieDankePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="JS Media" width={64} height={64} className="dark:hidden" />
          <img src="/logo-white.png" alt="JS Media" width={64} height={64} className="hidden dark:block" />
        </div>
        <h1 className="text-2xl font-semibold text-fg mb-3">Vielen Dank!</h1>
        <p className="text-muted text-sm leading-relaxed">
          Ihr Content-Strategie-Fragebogen wurde erfolgreich übermittelt. Wir melden uns bei Ihnen, sobald wir Ihre Antworten ausgewertet haben.
        </p>
      </div>
    </div>
  );
}

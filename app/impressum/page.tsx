import Link from "next/link";

export const metadata = { title: "Impressum – JS Media" };

export default function ImpressumPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-fg transition-colors">← Zurück</Link>
          <h1 className="text-2xl font-semibold text-fg mt-4 mb-1">Impressum</h1>
          <p className="text-sm text-muted">Angaben gemäß § 5 TMG</p>
        </div>

        <section className="space-y-1 text-sm text-fg">
          <p className="font-semibold">Jonathan Scheele</p>
          <p>Einzelunternehmen</p>
          <p>Enderstraße 94</p>
          <p>01277 Dresden</p>
        </section>

        <section className="space-y-1 text-sm">
          <h2 className="font-semibold text-fg">Kontakt</h2>
          <p className="text-muted">Telefon: <a href="tel:+4917184688848" className="hover:text-fg transition-colors">01718468848</a></p>
          <p className="text-muted">E-Mail: <a href="mailto:kontakt@jonathanscheele.de" className="hover:text-fg transition-colors">kontakt@jonathanscheele.de</a></p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-fg">Umsatzsteuer-ID</h2>
          <p className="text-muted">Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE366728811</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-fg">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p className="text-muted">Jonathan Scheele, Enderstraße 94, 01277 Dresden</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-fg">Streitschlichtung</h2>
          <p className="text-muted">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-muted">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-fg">Haftung für Inhalte</h2>
          <p className="text-muted">
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="text-muted">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-fg">Haftung für Links</h2>
          <p className="text-muted">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="font-semibold text-fg">Urheberrecht</h2>
          <p className="text-muted">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>
      </div>
    </div>
  );
}

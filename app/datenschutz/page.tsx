import Link from "next/link";

export const metadata = { title: "Datenschutz – JS Media" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-fg">{title}</h2>
      <div className="space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-fg transition-colors">← Zurück</Link>
          <h1 className="text-2xl font-semibold text-fg mt-4 mb-1">Datenschutz</h1>
        </div>

        <Section title="Einleitung und Überblick">
          <p>Wir haben diese Datenschutzerklärung verfasst, um Ihnen gemäß der Vorgaben der Datenschutz-Grundverordnung (EU) 2016/679 und anwendbaren nationalen Gesetzen zu erklären, welche personenbezogenen Daten wir als Verantwortliche – und die von uns beauftragten Auftragsverarbeiter (z. B. Softwareanbieter) – verarbeiten, zukünftig verarbeiten werden und welche rechtmäßigen Möglichkeiten Sie haben.</p>
          <p>Diese Datenschutzerklärung soll Ihnen die wichtigsten Aspekte so einfach und transparent wie möglich erklären. Wenn dennoch Fragen bleiben, wenden Sie sich bitte an die unten genannte verantwortliche Stelle.</p>
        </Section>

        <Section title="Anwendungsbereich">
          <p>Diese Datenschutzerklärung gilt für alle von uns verarbeiteten personenbezogenen Daten und alle personenbezogenen Daten, die von uns beauftragte Firmen (Auftragsverarbeiter) verarbeiten. Dazu zählen insbesondere:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>unsere Website und Onlineauftritte</li>
            <li>Social-Media-Präsenzen</li>
            <li>E-Mail- und Messenger-Kommunikation</li>
            <li>Tools zur Projektarbeit, Planung und Kundenbetreuung</li>
          </ul>
        </Section>

        <Section title="Rechtsgrundlagen der Verarbeitung">
          <p>Wir verarbeiten Ihre Daten nur, wenn mindestens eine der folgenden Bedingungen zutrifft:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
            <li>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</li>
            <li>Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO)</li>
            <li>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</li>
          </ul>
        </Section>

        <Section title="Kontaktdaten des Verantwortlichen">
          <p>Verantwortlich für die Datenverarbeitung ist:</p>
          <p className="text-fg font-medium">Jonathan Scheele</p>
          <p>E-Mail: <a href="mailto:kontakt@jonathanscheele.de" className="text-accent hover:underline">kontakt@jonathanscheele.de</a></p>
          <p>Adresse: Enderstraße 94, 01277 Dresden</p>
        </Section>

        <Section title="Speicherdauer">
          <p>Personenbezogene Daten speichern wir nur so lange, wie es für die jeweiligen Verarbeitungszwecke erforderlich ist. Gesetzliche Aufbewahrungsfristen (z. B. 6 oder 10 Jahre für Vertrags- und Steuerunterlagen) bleiben unberührt.</p>
        </Section>

        <Section title="Einsatz externer Tools zur Projektarbeit und Kommunikation">
          <div className="space-y-4">
            <div>
              <p className="font-medium text-fg">Google Workspace (Drive, Docs, Gmail, Meet, Kalender, Chat)</p>
              <p>Zur Dateiablage, Textverarbeitung, Terminorganisation, E-Mail- und Videokommunikation sowie Chat-Nachrichten verwenden wir Google Workspace. Anbieter: Google Ireland Limited. Die Datenverarbeitung erfolgt auf Grundlage eines AVV inkl. Standardvertragsklauseln (SCCs).</p>
            </div>
            <div>
              <p className="font-medium text-fg">Airtable</p>
              <p>Zur Verwaltung von Kundeninformationen, Formularen, Feedback und Redaktionsplänen setzen wir Airtable ein (Formagrid Inc., USA). Ein AVV inkl. SCCs ist abgeschlossen.</p>
            </div>
            <div>
              <p className="font-medium text-fg">Later.com</p>
              <p>Für die automatisierte Veröffentlichung von Social-Media-Beiträgen verwenden wir Later (Later Media Inc., Kanada). Ein AV-Vertrag ist abgeschlossen, und es gelten angemessene Datenschutzstandards.</p>
            </div>
          </div>
        </Section>

        <Section title="Ihre Rechte laut DSGVO">
          <p>Sie haben das Recht auf:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Auskunft über Ihre gespeicherten Daten</li>
            <li>Berichtigung oder Löschung Ihrer Daten</li>
            <li>Einschränkung der Verarbeitung</li>
            <li>Datenübertragbarkeit</li>
            <li>Widerruf einer Einwilligung</li>
            <li>Beschwerde bei der Aufsichtsbehörde</li>
          </ul>
        </Section>

        <Section title="Hinweis">
          <p>Diese Datenschutzerklärung ist urheberrechtlich geschützt und darf nur mit Zustimmung verwendet oder weitergegeben werden.</p>
        </Section>
      </div>
    </div>
  );
}

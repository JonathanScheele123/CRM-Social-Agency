import Link from "next/link";

export const metadata = { title: "AGB – JS Media" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-semibold text-fg">{title}</h2>
      <div className="space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

export default function AgbPage() {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-fg transition-colors">← Zurück</Link>
          <h1 className="text-2xl font-semibold text-fg mt-4 mb-1">Allgemeine Geschäftsbedingungen (AGB)</h1>
          <p className="text-sm text-muted">JS-Media – Social Media Agentur Dresden · Enderstraße 94, 01277 Dresden · Stand: 18.11.2025</p>
        </div>

        <Section title="§ 1 Anwendungsbereich und B2B-Klausel">
          <p>(1) Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen JS-Media und dem Kunden, sofern der Kunde Unternehmer im Sinne des § 14 BGB, eine juristische Person des öffentlichen Rechts oder ein öffentlich-rechtliches Sondervermögen ist.</p>
          <p>(2) <strong className="text-fg">Keine Verträge mit Verbrauchern:</strong> JS-Media schließt ausschließlich B2B-Verträge. Verträge mit Verbrauchern (§ 13 BGB) werden nicht geschlossen. Der Kunde versichert mit Vertragsschluss, als Unternehmer bzw. Kaufmann zu handeln. Ein Widerrufsrecht nach §§ 312g, 355 BGB (Fernabsatzrecht) besteht daher nicht.</p>
          <p>(3) <strong className="text-fg">Vorrang dieser AGB:</strong> Diese AGB gelten ausschließlich. Abweichende oder ergänzende Geschäftsbedingungen des Kunden werden nur Vertragsbestandteil, wenn JS-Media ihrer Geltung ausdrücklich schriftlich zugestimmt hat.</p>
        </Section>

        <Section title="§ 2 Leistungen von JS-Media und Mitwirkung des Kunden">
          <p>(1) <strong className="text-fg">Leistungsumfang:</strong> JS-Media erbringt für den Kunden – je nach individueller Vereinbarung – Dienstleistungen im Bereich Social-Media-Marketing und Content-Produktion. Dies umfasst insbesondere die Erstellung von digitalem Content, die Entwicklung von Content-Strategien, die laufende Remote-Betreuung der Social-Media-Präsenzen sowie nach Absprache Vor-Ort-Dreharbeiten.</p>
          <p>(2) <strong className="text-fg">Kein geschuldeter Erfolg:</strong> JS-Media garantiert keinen konkreten wirtschaftlichen oder werblichen Erfolg. Insbesondere übernimmt JS-Media keine Gewähr für das Erreichen bestimmter Ergebnisse (etwa Reichweite, ROI, Conversion Rates). Vereinbarte Zielgrößen stellen lediglich angestrebte Ziele dar, keinen Werkerfolg im Sinne der §§ 631 ff. BGB.</p>
          <p>(3) <strong className="text-fg">Mitwirkungspflichten des Kunden:</strong> Der Kunde verpflichtet sich, alle erforderlichen Mitwirkungshandlungen vollständig, richtig und zeitgerecht zu erbringen. Dazu zählt insbesondere die Bereitstellung aller notwendigen Informationen, Materialien und Freigaben.</p>
          <p>(4) <strong className="text-fg">Abnahme von Content:</strong> Der Kunde ist verpflichtet, erstellte Inhalte zeitnah zu prüfen und freizugeben oder Änderungswünsche klar zu formulieren. Lehnt der Kunde wiederholt dem Briefing entsprechende Vorschläge ohne triftigen Grund ab, gilt die Leistung als erbracht.</p>
          <p>(5) <strong className="text-fg">Leistungsgestaltung:</strong> JS-Media steht ein Leistungsbestimmungsrecht nach § 315 BGB zu und darf Technologien, Software-Tools oder Methoden nach eigenem Ermessen auswählen oder wechseln, sofern die Qualität nicht beeinträchtigt wird.</p>
        </Section>

        <Section title="§ 3 Vertragsschluss">
          <p>(1) Der Vertragsabschluss kann schriftlich (durch Unterzeichnung) oder fernmündlich (z. B. per Videotelefonat) erfolgen.</p>
          <p>(2) Kommt der Vertrag fernmündlich zustande, geschieht dies durch mündliche Angebots- und Annahmeerklärungen. JS-Media kann den Vertrag anschließend in Textform bestätigen.</p>
        </Section>

        <Section title="§ 4 Zahlungen, Preise und Bedingungen">
          <p>(1) Sämtliche Preise sind Nettopreise zzgl. gesetzlicher Umsatzsteuer.</p>
          <p>(2) Die Vergütung wird – sofern nicht abweichend geregelt – mit Rechnungsstellung sofort fällig.</p>
          <p>(3) Zahlungen erfolgen ausschließlich per Überweisung auf das in der Rechnung benannte Bankkonto.</p>
          <p>(4) Sämtliche Fremdkosten (z. B. Anzeigenbudgets, Lizenzgebühren, Materialkosten) sowie Reisekosten trägt der Kunde.</p>
          <p>(5) Eine Aufrechnung gegen Forderungen von JS-Media ist nur mit unbestrittenen oder rechtskräftig festgestellten Gegenforderungen zulässig.</p>
        </Section>

        <Section title="§ 5 Zusatzleistungen und gesonderte Vergütung">
          <p>(1) Zusatzleistungen sind Leistungen, die nicht im Hauptvertrag enthalten sind und gesondert vergütet werden.</p>
          <p>(2) Typische Zusatzleistungen umfassen u. a. zusätzliche Kurzvideos, Longform-Videos, Fotos, Karussell-Beiträge, Beratungssitzungen, Personas und Skripte.</p>
          <p>(3) Die Vergütung wird im Einzelfall vereinbart oder nach den üblichen Vergütungssätzen gemäß Anlage 2 abgerechnet.</p>
          <p>(4) Zusatzleistungen werden nur nach vorheriger Freigabe durch den Kunden erbracht.</p>
        </Section>

        <Section title="§ 6 Vertragslaufzeit und Kündigung">
          <p>(1) Der Vertrag hat die im Hauptvertrag angegebene Mindestlaufzeit. Ist keine Mindestlaufzeit vereinbart, beträgt diese 3 Monate.</p>
          <p>(2) Bei vereinbarter automatischer Verlängerung verlängert sich der Vertrag automatisch um die ursprüngliche Laufzeit, wenn er nicht mit einer Frist von 1 Monat zum Laufzeitende schriftlich gekündigt wird.</p>
          <p>(3) Eine ordentliche Kündigung vor Ablauf der Mindestlaufzeit ist ausgeschlossen. Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
          <p>(4) Jede Kündigung bedarf mindestens der Textform (z. B. per E-Mail).</p>
        </Section>

        <Section title="§ 7 Verzug des Kunden / Rücktritt">
          <p>(1) Leistungsfristen beginnen erst zu laufen, nachdem die vereinbarte Vorauszahlung eingegangen ist und der Kunde alle notwendigen Mitwirkungen erbracht hat.</p>
          <p>(2) Bei Zahlungsverzug ist JS-Media berechtigt, weitere Leistungen bis zum Ausgleich des offenen Betrags zurückzuhalten.</p>
          <p>(3) Bei vereinbarter Ratenzahlung und Verzug mit mindestens zwei aufeinanderfolgenden Raten wird der gesamte Restbetrag sofort fällig.</p>
          <p>(4) Freie Kündigungs- oder Rücktrittsrechte des Kunden (insbesondere gemäß §§ 648, 648a BGB) werden im Rahmen dieses B2B-Vertrages ausgeschlossen.</p>
          <p>(5) Im Verzugsfall kann JS-Media Verzugszinsen (9 Prozentpunkte über Basiszinssatz) sowie eine Verzugspauschale von 40 € gemäß § 288 BGB geltend machen.</p>
        </Section>

        <Section title="§ 8 Erfüllung der Leistungen">
          <p>(1) JS-Media ist berechtigt, sich zur Vertragserfüllung der Mitarbeit Dritter (Erfüllungsgehilfen oder Subunternehmer) zu bedienen.</p>
          <p>(2) JS-Media erbringt Dienstleistungen und schuldet kein Werk. Auf Verlangen erteilt JS-Media Auskunft über erbrachte Leistungen.</p>
          <p>(3) Hinderungen durch den Kunden (fehlende Zuarbeit, verspätete Freigaben etc.) berühren den Vergütungsanspruch von JS-Media nicht.</p>
        </Section>

        <Section title="§ 9 Schutzrechte Dritter an Kundenvorlagen">
          <p>Der Kunde gewährleistet, dass alle von ihm bereitgestellten Materialien frei von Rechten Dritter sind oder er über die notwendigen Nutzungsrechte verfügt. Der Kunde stellt JS-Media von sämtlichen Ansprüchen Dritter aus der Verwendung solcher Materialien frei.</p>
        </Section>

        <Section title="§ 10 Nutzungsrechte an Arbeitsergebnissen">
          <p>(1) Der Kunde erhält an den erstellten Arbeitsergebnissen ein einfaches, nicht-ausschließliches Nutzungsrecht. Darunter fallen alle erstellten Inhalte, Fotos, Videos, Konzepte, Personas, Skripte und sonstige kreative Leistungen.</p>
          <p>(2) Die Einräumung der Nutzungsrechte steht unter dem Vorbehalt der vollständigen Bezahlung der Vergütung.</p>
          <p>(3) Bei Ratenzahlung geht das Nutzungsrecht erst mit Zahlung der letzten Rate vollständig auf den Kunden über.</p>
          <p>(4) Die Weitergabe an Dritte und Bearbeitungen sind ohne vorherige Zustimmung von JS-Media ausgeschlossen.</p>
          <p className="bg-elevated/50 rounded-xl p-3 border border-divider"><em>Hinweis: Das Recht des Kunden, gelieferte Inhalte auf seinen Social-Media-Kanälen zu veröffentlichen und der Öffentlichkeit zugänglich zu machen, bleibt hiervon unberührt.</em></p>
        </Section>

        <Section title="§ 11 Referenznennung und Vertraulichkeit">
          <p>JS-Media ist nur mit vorheriger schriftlicher Zustimmung des Kunden berechtigt, die Zusammenarbeit als Referenz zu benennen oder das Firmenlogo des Kunden zu Werbezwecken zu verwenden. Ohne Zustimmung behandelt JS-Media die Zusammenarbeit vertraulich.</p>
        </Section>

        <Section title="§ 12 Haftung von JS-Media">
          <p>(1) JS-Media haftet nur bei Vorsatz oder grober Fahrlässigkeit. Bei einfacher Fahrlässigkeit haftet JS-Media nur für Schäden aus Verletzungen von Leib, Leben oder Gesundheit sowie für Schäden aus der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), dann jedoch beschränkt auf den vorhersehbaren, vertragstypischen Schaden.</p>
          <p>(2) Eine Haftung für Datenverlust wird auf den typischen Wiederherstellungsaufwand bei regelmäßiger Datensicherung beschränkt.</p>
          <p>(3) JS-Media haftet nicht für Sperren oder Deaktivierungen durch Drittplattformen (z. B. Instagram, Facebook, TikTok) oder für sonstige unvorhersehbare Eingriffe Dritter.</p>
          <p>(4) Im Übrigen ist die Haftung von JS-Media – insbesondere für entgangenen Gewinn, indirekte Schäden und Folgeschäden – ausgeschlossen.</p>
        </Section>

        <Section title="§ 13 Datenschutz">
          <p>(1) Der Kunde stellt sicher, dass er bei der Übermittlung personenbezogener Daten die DSGVO und das BDSG einhält.</p>
          <p>(2) Der Kunde stellt JS-Media von jeder Haftung frei, die aus einer Datenschutzverletzung durch den Kunden entsteht.</p>
          <p>(3) JS-Media behandelt alle personenbezogenen Daten vertraulich und verwendet sie ausschließlich zur Vertragserfüllung. Soweit JS-Media personenbezogene Daten im Auftrag verarbeitet, wird eine Auftragsverarbeitungsvereinbarung nach Art. 28 DSGVO geschlossen.</p>
        </Section>

        <Section title="§ 14 Schlussbestimmungen">
          <p>(1) Änderungen dieser AGB bedürfen der Schriftform. Individuelle Vereinbarungen haben Vorrang vor diesen AGB.</p>
          <p>(2) Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Ausschließlicher Gerichtsstand ist Dresden.</p>
          <p>(3) Sollte eine Bestimmung dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (Salvatorische Klausel).</p>
        </Section>

        <div className="border-t border-divider pt-8 space-y-8">
          <Section title="Anlage 1 – Formelle Leistungsbeschreibung">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-fg mb-1">Modul 1 – Strategie &amp; Remote-Content-Betreuung</p>
                <p>Vollständige Remote-Betreuung der Social-Media-Kanäle inkl. Zielgruppenanalyse, Content-Strategie, Content-Ideen &amp; Skripte, Videoschnitt, Planung &amp; Veröffentlichung sowie Performance-Analyse. Inklusive zwei Zielgruppen-Personas und einem monatlichen Strategie-Call (freiwillig). Keine Vor-Ort-Produktion.</p>
              </div>
              <div>
                <p className="font-medium text-fg mb-1">Modul 2 – Full-Service inkl. Drehtag vor Ort</p>
                <p>Alle Leistungen aus Modul 1 plus professionelle Vor-Ort-Produktion von Foto- und Videomaterial in den Räumlichkeiten des Kunden. Mindestens ein Drehtag vor Ort inklusive, sofern vertraglich keine abweichende Anzahl festgelegt ist.</p>
              </div>
              <div>
                <p className="font-medium text-fg mb-1">Strategieberatung (Einzelstunden)</p>
                <p>Individuelle Beratung zu Strategieentwicklung, Plattformauswahl, Zielgruppen und Content-Planung. Vergütung: 200 € netto pro Stunde, abgerechnet im 15-Minuten-Takt. Keine operative Umsetzung enthalten.</p>
              </div>
              <div>
                <p className="font-medium text-fg mb-1">Strategie-Sprechstunde (Regelmäßige Beratung)</p>
                <p>Wie Strategieberatung (Einzelstunden), jedoch in fest vereinbarten regelmäßigen Abständen mit kontinuierlicher Begleitung und laufender Strategieoptimierung.</p>
              </div>
            </div>
          </Section>

          <Section title="Anlage 2 – Zusatzleistungen &amp; Vergütung">
            <p>Für über den vereinbarten Umfang hinausgehende Zusatzleistungen gelten folgende Konditionen (alle Preise netto zzgl. gesetzlicher Umsatzsteuer):</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="border-b border-divider">
                    <th className="text-left py-2 pr-4 text-fg font-medium">#</th>
                    <th className="text-left py-2 pr-4 text-fg font-medium">Zusatzleistung</th>
                    <th className="text-left py-2 pr-4 text-fg font-medium">Einheit</th>
                    <th className="text-right py-2 text-fg font-medium">Netto-Preis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/50">
                  {[
                    ["1", "Kurzvideos (unter 1 Minute)", "pro Video", "120 €"],
                    ["2", "Longform-Videos (über 5 Minuten, max. 12 Minuten)", "pro Video", "300 €"],
                    ["3", "Fotos", "pro Bild", "60 €"],
                    ["4", "Karussellbeiträge (Mehrbild-Postings)", "pro Beitrag", "130 €"],
                    ["5", "Zusätzliche Beratungseinheit", "pro Stunde", "200 €"],
                    ["6", "Zusätzliche Persona", "pro Zielgruppenprofil", "80 €"],
                    ["7", "Zusätzliches Skript", "pro Skript", "40 €"],
                  ].map(([nr, name, einheit, preis]) => (
                    <tr key={nr}>
                      <td className="py-2 pr-4 text-subtle">{nr}</td>
                      <td className="py-2 pr-4">{name}</td>
                      <td className="py-2 pr-4 text-subtle">{einheit}</td>
                      <td className="py-2 text-right font-medium text-fg">{preis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-subtle pt-1">Abrechnung erfolgt monatlich nach tatsächlichem Verbrauch. Zusatzleistungen werden nur erbracht, wenn sie vom Kunden ausdrücklich beauftragt oder freigegeben wurden.</p>
          </Section>
        </div>

        <div className="border-t border-divider pt-6 text-sm text-muted space-y-1">
          <p>JS-Media · Enderstraße 94 · 01277 Dresden</p>
          <p>Telefon: <a href="tel:+4917184688848" className="hover:text-fg transition-colors">01718468848</a> · E-Mail: <a href="mailto:kontakt@jonathanscheele.de" className="hover:text-fg transition-colors">kontakt@jonathanscheele.de</a></p>
        </div>
      </div>
    </div>
  );
}

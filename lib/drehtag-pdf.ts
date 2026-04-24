// eslint-disable-next-line @typescript-eslint/no-require-imports
const PdfPrinter = require("pdfmake/js/index.js");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TDocumentDefinitions = any;

const LOGO_B64 = process.env.LOGO_B64_INLINE ?? "";

const ACCENT = "#b8956a";
const INK    = "#0f0f0f";
const SOFT   = "#444444";
const MUTED  = "#888888";
const RULE   = "#e0ddd8";
const BGCARD = "#faf9f7";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const vfsFonts = require("pdfmake/build/vfs_fonts");
const fonts = {
  Roboto: {
    normal:      Buffer.from(vfsFonts["Roboto-Regular.ttf"],    "base64"),
    bold:        Buffer.from(vfsFonts["Roboto-Medium.ttf"],     "base64"),
    italics:     Buffer.from(vfsFonts["Roboto-Italic.ttf"],     "base64"),
    bolditalics: Buffer.from(vfsFonts["Roboto-MediumItalic.ttf"], "base64"),
  },
};

export function drehtageAbsteigen(opts: {
  kundenname: string;
  datum: string;
  uhrzeit: string;
  adresse: string;
}): Promise<Buffer> {
  const { kundenname, datum, uhrzeit, adresse } = opts;

  const printer = new PdfPrinter(fonts);

  const infoRow = (label: string, wert: string) => ({
    columns: [
      { text: label, fontSize: 7, bold: true, color: MUTED, characterSpacing: 1.2, width: 28 },
      { text: wert,  fontSize: 9, bold: true, color: INK, width: "*" },
    ],
    columnGap: 4,
    margin: [0, 2, 0, 2] as [number, number, number, number],
  });

  const schritt = (nr: string, tag: string, titel: string, beschr: string) => ({
    columns: [
      {
        width: 22,
        stack: [
          {
            canvas: [{
              type: "ellipse",
              x: 11, y: 11, r1: 10, r2: 10,
              color: INK,
            }],
            margin: [0, 0, 0, 0],
          },
          {
            text: nr,
            fontSize: 7.5, bold: true, color: "#ffffff",
            alignment: "center",
            margin: [0, -17, 0, 0],
          },
        ],
      },
      {
        width: "*",
        stack: [
          { text: tag, fontSize: 6.5, bold: true, color: ACCENT, characterSpacing: 1.0, margin: [0, 1, 0, 1] },
          { text: titel, fontSize: 9.5, bold: true, color: INK, margin: [0, 0, 0, 3] },
          { text: beschr, fontSize: 8.5, color: SOFT, lineHeight: 1.5 },
        ],
        fillColor: BGCARD,
        margin: [8, 0, 0, 0],
      },
    ],
    columnGap: 0,
    margin: [0, 0, 0, 10] as [number, number, number, number],
  });

  const bullet = (text: string) => ({
    columns: [
      { text: "—", fontSize: 9, bold: true, color: ACCENT, width: 12 },
      { text, fontSize: 8.5, color: SOFT, lineHeight: 1.55, width: "*" },
    ],
    columnGap: 4,
    margin: [0, 0, 0, 5] as [number, number, number, number],
  });

  const sectionLabel = (label: string) => ({
    text: label.toUpperCase(),
    fontSize: 6.5, bold: true, color: ACCENT,
    characterSpacing: 1.6,
    margin: [0, 0, 0, 2] as [number, number, number, number],
  });

  const sectionTitle = (title: string) => ({
    text: title,
    fontSize: 14, bold: true, color: INK,
    margin: [0, 0, 0, 8] as [number, number, number, number],
  });

  const rule = () => ({
    canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: RULE }],
    margin: [0, 8, 0, 10] as [number, number, number, number],
  });

  const docDef: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [50, 50, 50, 60],

    content: [
      // ── Header ──────────────────────────────────────────────────────
      {
        columns: [
          {
            stack: [
              ...(LOGO_B64 ? [{ image: `data:image/png;base64,${LOGO_B64}`, width: 36, margin: [0, 0, 0, 5] as [number,number,number,number] }] : []),
              { text: "JS Media", fontSize: 10, bold: true, color: INK },
              { text: "Inhaber: Jonathan Scheele\nEnderstraße 94 · 01277 Dresden", fontSize: 7.5, color: MUTED, lineHeight: 1.5 },
            ],
            width: "*",
          },
          {
            stack: [
              { text: "KONTAKT", fontSize: 7, bold: true, color: MUTED, characterSpacing: 1.2, alignment: "right" },
              { text: "handwerk.jonathanscheele.de", fontSize: 8, color: ACCENT, alignment: "right" },
              { text: "kontakt@jonathanscheele.de", fontSize: 8, color: SOFT, alignment: "right" },
              { text: "+49 171 8468848", fontSize: 8, color: SOFT, alignment: "right" },
            ],
            width: 180,
          },
        ],
        margin: [0, 0, 0, 6],
      },

      // Divider
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: RULE }], margin: [0, 0, 0, 10] },

      // Datum rechts
      { text: `Datum: ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`, fontSize: 8, color: MUTED, alignment: "right", margin: [0, 0, 0, 8] },

      // Empfänger-Felder
      {
        columns: [
          {
            stack: [
              { text: "VORBEREITET FÜR", fontSize: 6.5, bold: true, color: ACCENT, characterSpacing: 1.2 },
              { text: kundenname, fontSize: 11, bold: true, color: INK, margin: [0, 3, 0, 0] },
            ],
            fillColor: BGCARD,
            width: "*",
          },
          { width: 12, text: "" },
          {
            stack: [
              { text: "DREHTAG", fontSize: 6.5, bold: true, color: ACCENT, characterSpacing: 1.2 },
              infoRow("Datum", datum),
              infoRow("Uhrzeit", `${uhrzeit} Uhr`),
              infoRow("Ort", adresse),
            ],
            fillColor: BGCARD,
            width: 200,
          },
        ],
        margin: [0, 0, 0, 14],
      },

      // Accent top bars
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 3,   lineColor: INK },
          { type: "line", x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1.5, lineColor: ACCENT },
        ],
        margin: [0, 0, 0, 12],
      },

      // Dokument-Label + Titel
      { text: "DOKUMENT", fontSize: 6.5, bold: true, color: ACCENT, characterSpacing: 1.6, margin: [0, 0, 0, 2] },
      { text: "Ablauf & Hinweise zum Drehtag", fontSize: 22, bold: true, color: INK, margin: [0, 0, 0, 10] },

      // Intro
      { text: "Damit Ihr Drehtag reibungslos verläuft und das Beste erreicht wird, finden Sie nachfolgend alle relevanten Informationen im Überblick. Bei Fragen stehe ich jederzeit zur Verfügung.", fontSize: 9, color: SOFT, lineHeight: 1.65, margin: [0, 0, 0, 12] },

      rule(),

      // ── Ablaufplan ──────────────────────────────────────────────────
      sectionLabel("Ablaufplan"),
      sectionTitle("Geplanter Tagesablauf"),

      schritt("1", "30–60 Min. vor Start", "Ankunft & Begrüßung",
        "Das Team trifft frühzeitig ein für eine entspannte Abstimmung, erste Eindrücke der Location und die gemeinsame Festlegung der Drehorte."),
      schritt("2", "Aufbauphase", "Technikaufbau & Lichtcheck",
        "Kamera, Ton und Licht werden präzise eingerichtet. Die Lichtsituation wird geprüft und optimale Positionen für die geplanten Aufnahmen abgestimmt."),
      schritt("3", "Hauptproduktion", "Drehstart",
        "Die Produktion läuft in mehreren aufeinander abgestimmten Blöcken ab — mit Arbeitsabläufen, authentischen Team-Szenen, Interviews sowie besonderen Projekten oder Produkten."),
      schritt("4", "Abschluss", "Nachbesprechung & nächste Schritte",
        "Nach Abschluss der Aufnahmen werden offene Punkte besprochen und der voraussichtliche Liefertermin für die fertigen Inhalte festgehalten."),

      rule(),

      // ── Checkliste ──────────────────────────────────────────────────
      sectionLabel("Checkliste"),
      sectionTitle("Ihre Vorbereitung auf den Tag"),

      bullet("Zugang zu allen geplanten Drehorten — bitte frühzeitig organisieren und kommunizieren"),
      bullet("Eine feste Ansprechperson vor Ort für kurzfristige Abstimmungen und Entscheidungen"),
      bullet("Relevante Produkte, Werkzeuge oder laufende Projekte, die im Fokus der Produktion stehen sollen"),
      bullet("Bereitschaft einiger Teammitglieder für kurze Szenen oder Statements — freiwillig, kein Skript nötig"),

      rule(),

      // ── Kamera-Tipps ────────────────────────────────────────────────
      sectionLabel("Empfehlungen"),
      sectionTitle("Wirkung vor der Kamera"),

      bullet("Saubere, einheitliche Arbeitskleidung mit sichtbarem Firmenlogo — sofern vorhanden"),
      bullet("Dezente Farben bevorzugen: grelle Töne, große Muster und stark reflektierende Materialien meiden"),
      bullet("Versprecher sind kein Problem — alles wird in der Nachbearbeitung präzise geschnitten"),
      bullet("Natürliches, entspanntes Auftreten wirkt authentischer — einfach normal sprechen genügt"),
    ],

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: "Zahlungsempfänger: Jonathan Scheele – JS-Media · Bank: Finom Payments · BIC: FNOMDEB2 · IBAN: DE72 1001 8000 0934 7407 08", fontSize: 6.5, color: MUTED },
        { text: `© JS Media · handwerk.jonathanscheele.de · Seite ${currentPage}/${pageCount}`, fontSize: 6.5, color: MUTED, alignment: "right" },
      ],
      margin: [50, 12, 50, 0],
    }),

    defaultStyle: { font: "Roboto" },
  };

  return new Promise((resolve, reject) => {
    const doc = printer.createPdfKitDocument(docDef);
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}

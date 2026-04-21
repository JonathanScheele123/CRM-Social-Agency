export type EmailVorlage = {
  id: string;
  name: string;
  beschreibung: string;
  betreff: string;
  html: string;
};

export const EMAIL_VORLAGEN: EmailVorlage[] = [
  {
    id: "leer",
    name: "Leere Vorlage",
    beschreibung: "Keine Vorlage – freies Schreiben",
    betreff: "",
    html: "",
  },
];

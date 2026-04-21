import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import { NextRequest } from "next/server";

function gmailClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  );
  oauth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  return google.gmail({ version: "v1", auth: oauth2 });
}

function headerWert(headers: { name?: string | null; value?: string | null }[], name: string) {
  return headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.rolle !== "ADMIN") {
    return Response.json({ fehler: "Nicht autorisiert." }, { status: 401 });
  }

  const kundenprofilId = req.nextUrl.searchParams.get("kundenprofilId");
  if (!kundenprofilId) return Response.json({ fehler: "kundenprofilId fehlt." }, { status: 400 });

  const profil = await prisma.kundenprofil.findUnique({
    where: { id: kundenprofilId },
    select: {
      emailAnsprechpartner: true,
      emailDirekt: true,
      emailFreigabeVerantwortlicher: true,
      emailFreigabeVerantwortlicher2: true,
      zugriffe: { select: { user: { select: { email: true } } } },
    },
  });
  if (!profil) return Response.json({ fehler: "Kundenprofil nicht gefunden." }, { status: 404 });

  const emails = new Set<string>();
  if (profil.emailAnsprechpartner) emails.add(profil.emailAnsprechpartner);
  if (profil.emailDirekt) emails.add(profil.emailDirekt);
  if (profil.emailFreigabeVerantwortlicher) emails.add(profil.emailFreigabeVerantwortlicher);
  if (profil.emailFreigabeVerantwortlicher2) emails.add(profil.emailFreigabeVerantwortlicher2);
  for (const z of profil.zugriffe) emails.add(z.user.email);

  const emailListe = [...emails];
  if (emailListe.length === 0) return Response.json({ nachrichten: [], benutzerEmails: [] });

  const gmail = gmailClient();
  const query = emailListe.map(e => `from:${e} OR to:${e}`).join(" OR ");

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50,
  });

  const messageIds = listRes.data.messages ?? [];
  if (messageIds.length === 0) return Response.json({ nachrichten: [], benutzerEmails: emailListe });

  const nachrichten = await Promise.all(
    messageIds.map(async ({ id }) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: id!,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });
      const h = msg.data.payload?.headers ?? [];
      const von = headerWert(h, "From");
      const an = headerWert(h, "To");

      const zugehoerigeEmail = emailListe.find(e =>
        von.toLowerCase().includes(e.toLowerCase()) || an.toLowerCase().includes(e.toLowerCase())
      ) ?? null;

      return {
        id: msg.data.id,
        threadId: msg.data.threadId,
        von,
        an,
        betreff: headerWert(h, "Subject"),
        datum: headerWert(h, "Date"),
        snippet: msg.data.snippet ?? "",
        labelIds: msg.data.labelIds ?? [],
        zugehoerigeEmail,
      };
    })
  );

  nachrichten.sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());

  return Response.json({ nachrichten, benutzerEmails: emailListe });
}

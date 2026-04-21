import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.rolle !== "ADMIN") {
    return NextResponse.json({ fehler: "Kein Zugriff" }, { status: 403 });
  }

  const { beschreibung } = await req.json();
  if (!beschreibung?.trim()) {
    return NextResponse.json({ fehler: "Beschreibung fehlt" }, { status: 400 });
  }

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Erstelle einen prägnanten, kreativen Titel (max. 6 Wörter) für folgenden Social-Media-Content:\n\n${beschreibung}\n\nNur den Titel ausgeben, keine Erklärung.`,
      },
    ],
  });

  const titel = (message.content[0] as { type: string; text: string }).text.trim().replace(/^["']|["']$/g, "");
  return NextResponse.json({ titel });
}

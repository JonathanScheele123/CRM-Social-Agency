// Sendet eine Nachricht via Telegram Bot an den konfigurierten Chat.
// `to` wird ignoriert — alle Notifications gehen an TELEGRAM_CHAT_ID.
export async function sendSms(_to: string, body: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[telegram] Konfiguration fehlt — Nachricht übersprungen.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: body }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram-Fehler ${res.status}: ${err}`);
  }
}

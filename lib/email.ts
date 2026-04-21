import nodemailer from "nodemailer";

function createTransporter() {
  // Always use SMTP for sending (App Password).
  // GMAIL_* vars are reserved for Gmail API read access (Postfach).
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function absoluteImages(html: string): string {
  const base = (process.env.NEXTAUTH_URL ?? "").replace(/\/$/, "");
  if (!base) return html;
  // Replace src="/... with src="https://domain/...
  return html.replace(/src="(\/[^"]+)"/g, `src="${base}$1"`);
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const address = process.env.GMAIL_FROM ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;
  if (!address) throw new Error("Kein E-Mail-Absender konfiguriert.");

  const from = `"JS-Media Social Media Agentur" <${address}>`;
  const resolvedHtml = html ? absoluteImages(html) : html;

  const transporter = createTransporter();
  await transporter.sendMail({ from, to, subject, text, html: resolvedHtml, replyTo });
}

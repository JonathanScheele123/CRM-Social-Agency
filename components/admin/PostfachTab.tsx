"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useT, useLang } from "@/lib/i18n";

// ── Types ─────────────────────────────────────────────────────────────────────

type EmailVorlage = {
  id: string;
  name: string;
  beschreibung: string | null;
  betreff: string;
  html: string;
};

type Nachricht = {
  id: string;
  threadId: string;
  von: string;
  an: string;
  betreff: string;
  datum: string;
  snippet: string;
  labelIds: string[];
  zugehoerigeEmail: string | null;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const MARK_FARBEN = [
  { hex: "#ef4444", label: "Rot" },
  { hex: "#f97316", label: "Orange" },
  { hex: "#eab308", label: "Gelb" },
  { hex: "#22c55e", label: "Grün" },
  { hex: "#3b82f6", label: "Blau" },
  { hex: "#8b5cf6", label: "Lila" },
];

const MARK_KEY = "postfach_markierungen";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDatum(dateStr: string, locale = "de-DE") {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const heute = new Date();
  const isHeute =
    d.getDate() === heute.getDate() &&
    d.getMonth() === heute.getMonth() &&
    d.getFullYear() === heute.getFullYear();
  if (isHeute) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function absenderName(von: string) {
  const m = von.match(/^"?([^"<]+)"?\s*</);
  if (m) return m[1].trim();
  return von.replace(/<.*>/, "").trim() || von;
}

function extractEmail(von: string): string {
  const m = von.match(/<([^>]+)>/);
  return m ? m[1] : von.trim();
}

function istUngelesen(labelIds: string[]) {
  return labelIds.includes("UNREAD");
}

function emailKurz(email: string) {
  return email.length > 28 ? email.slice(0, 26) + "…" : email;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── WYSIWYG editor injection ──────────────────────────────────────────────────

function injectEditScript(html: string, origin: string): string {
  const base = `<base href="${origin}/">`;
  const style = `<style id="__es">
[data-ce]:hover{outline:1px dashed rgba(184,149,106,0.45);border-radius:2px;cursor:text;}
[data-ce]:focus{outline:2px solid #b8956a;border-radius:2px;outline-offset:1px;}
a[data-lk]:hover{box-shadow:0 0 0 2px #b8956a;border-radius:3px;cursor:pointer !important;}
a[data-lk]{cursor:pointer !important;}
#__lp{position:fixed;z-index:99999;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;box-shadow:0 8px 28px rgba(0,0,0,.14);display:none;flex-direction:column;gap:8px;width:290px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}
#__lp label{font-size:11px;color:#64748b;font-weight:500;}
#__lp input{border:1px solid #e2e8f0;border-radius:6px;padding:6px 10px;font-size:13px;width:100%;box-sizing:border-box;outline:none;}
#__lp input:focus{border-color:#b8956a;box-shadow:0 0 0 2px rgba(184,149,106,.18);}
#__lp .r{display:flex;gap:6px;justify-content:flex-end;margin-top:2px;}
#__lp .ok{background:#b8956a;color:#fff;border:none;border-radius:6px;padding:5px 14px;font-size:12px;cursor:pointer;font-weight:500;}
#__lp .cl{background:#f8fafc;color:#64748b;border:1px solid #e2e8f0;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;}
</style>`;
  const popover = `<div id="__lp">
<label>Text</label><input id="__lt" type="text">
<label>URL</label><input id="__lu" type="url" placeholder="https://…">
<div class="r"><button class="cl" onclick="__cl()">Abbrechen</button><button class="ok" onclick="__sl()">Speichern</button></div>
</div>`;
  const script = `<script>
(function(){
var lp=document.getElementById('__lp'),lt=document.getElementById('__lt'),lu=document.getElementById('__lu'),cur=null;
function clean(){
  var d=document.documentElement.cloneNode(true);
  ['#__lp','#__es'].forEach(function(s){var n=d.querySelector(s);if(n)n.parentNode.removeChild(n);});
  d.querySelectorAll('script').forEach(function(n){n.parentNode.removeChild(n);});
  d.querySelectorAll('[data-ce],[data-lk]').forEach(function(el){
    el.removeAttribute('contenteditable');el.removeAttribute('data-ce');el.removeAttribute('data-lk');
  });
  return '<!DOCTYPE html>'+d.outerHTML;
}
function su(){window.parent.postMessage({type:'html-update',html:clean()},'*');}
window.__cl=function(){lp.style.display='none';};
window.__sl=function(){
  if(cur){
    if(lu.value)cur.href=lu.value;
    if(lt.value)cur.textContent=lt.value;
    su();
  }
  __cl();
};
document.querySelectorAll('p').forEach(function(el){
  if(Array.from(el.children).some(function(c){return['P','DIV','TABLE','TR','TD'].includes(c.tagName);}))return;
  el.setAttribute('data-ce','1');
  el.contentEditable='true';
  el.addEventListener('input',su);
  el.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey)e.preventDefault();});
});
document.querySelectorAll('a').forEach(function(a){
  if(a.querySelector('img'))return;
  a.setAttribute('data-lk','1');
  a.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();cur=a;
    lt.value=a.textContent.trim();
    lu.value=a.getAttribute('href')||'';
    var r=a.getBoundingClientRect();
    lp.style.display='flex';
    var t=r.bottom+6,l=r.left;
    if(l+295>window.innerWidth)l=window.innerWidth-300;
    if(t+180>window.innerHeight)t=r.top-186;
    lp.style.top=t+'px';lp.style.left=l+'px';
    setTimeout(function(){lt.select();},50);
  });
});
document.addEventListener('click',function(e){if(!lp.contains(e.target))__cl();});
})();
<\/script>`;
  return html
    .replace("<head>", "<head>\n" + base)
    .replace("</body>", style + "\n" + popover + "\n" + script + "\n</body>");
}

// ── FarbPicker ────────────────────────────────────────────────────────────────

function FarbPicker({
  aktive,
  onChange,
}: {
  aktive: string | null;
  onChange: (c: string | null) => void;
}) {
  const t = useT();
  return (
    <div className="absolute right-0 top-full mt-1 z-30 bg-card border border-divider rounded-xl shadow-xl p-2.5 flex items-center gap-2">
      {MARK_FARBEN.map((f) => (
        <button
          key={f.hex}
          type="button"
          title={f.label}
          onClick={() => onChange(aktive === f.hex ? null : f.hex)}
          className="w-5 h-5 rounded-full transition-transform hover:scale-125 shrink-0"
          style={{
            backgroundColor: f.hex,
            boxShadow:
              aktive === f.hex
                ? `0 0 0 2px white, 0 0 0 3.5px ${f.hex}`
                : undefined,
          }}
        />
      ))}
      {aktive && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title={t.postfach.markierungEntfernen}
          className="w-5 h-5 rounded-full bg-elevated border border-divider text-muted text-[10px] hover:text-fg transition-colors flex items-center justify-center shrink-0"
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ── EmpfaengerInput ───────────────────────────────────────────────────────────

function EmpfaengerInput({
  value,
  onChange,
  vorschlaege,
}: {
  value: string;
  onChange: (v: string) => void;
  vorschlaege: string[];
}) {
  const t = useT();
  const [offen, setOffen] = useState(false);
  const [filter, setFilter] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  const gefiltert = vorschlaege.filter(
    (e) => filter.length === 0 || e.toLowerCase().includes(filter.toLowerCase())
  );

  function waehlen(email: string) {
    onChange(email);
    setFilter(email);
    setOffen(false);
  }

  function handleInput(v: string) {
    setFilter(v);
    onChange(v);
    setOffen(true);
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOffen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="email"
        value={filter}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOffen(true)}
        placeholder={t.postfach.adresseEingeben}
        className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {offen && gefiltert.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-card border border-divider rounded-xl shadow-lg overflow-hidden">
          {gefiltert.map((e) => (
            <li key={e}>
              <button
                type="button"
                onMouseDown={() => waehlen(e)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-elevated ${
                  value === e ? "text-accent font-medium" : "text-fg"
                }`}
              >
                {e}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Antwort / Weiterleiten Modal ──────────────────────────────────────────────

function AntwortModal({
  modus,
  nachricht,
  zitatHtml,
  zitatText,
  benutzerEmails,
  onClose,
}: {
  modus: "reply" | "forward";
  nachricht: Nachricht;
  zitatHtml: string;
  zitatText: string;
  benutzerEmails: string[];
  onClose: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [schritt, setSchritt] = useState<"vorlage" | "compose">("vorlage");
  const [vorlage, setVorlage] = useState<EmailVorlage | null>(null);
  const [vorlagen, setVorlagen] = useState<EmailVorlage[]>([]);
  const [vorlagenLaden, setVorlagenLaden] = useState(true);
  const [an, setAn] = useState(modus === "reply" ? extractEmail(nachricht.von) : "");
  const [betreff, setBetreff] = useState(
    modus === "reply"
      ? nachricht.betreff.startsWith("Re:") ? nachricht.betreff : `Re: ${nachricht.betreff}`
      : `Fwd: ${nachricht.betreff}`
  );
  const [htmlForIframe, setHtmlForIframe] = useState("");
  const currentHtmlRef = useRef("");
  const backdropMouseDownRef = useRef(false);
  const [senden, setSenden] = useState(false);
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/email/vorlagen")
      .then((r) => r.json())
      .then((d) => setVorlagen(d.vorlagen ?? []))
      .catch(() => {})
      .finally(() => setVorlagenLaden(false));
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "html-update") currentHtmlRef.current = e.data.html as string;
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function vorlaegWaehlen(v: EmailVorlage) {
    currentHtmlRef.current = v.html;
    setVorlage(v);
    setHtmlForIframe(v.html ? injectEditScript(v.html, window.location.origin) : "");
    setSchritt("compose");
  }

  function quoteBlock(): string {
    const kopf =
      modus === "reply"
        ? `<p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Am ${formatDatum(nachricht.datum)} schrieb ${escapeHtml(nachricht.von)}:</p>`
        : `<p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">&#8212;&#8212;&#8212;&#8212;&#8212;&#8212; Weitergeleitete Nachricht &#8212;&#8212;&#8212;&#8212;&#8212;&#8212;<br>Von: ${escapeHtml(nachricht.von)}<br>Datum: ${formatDatum(nachricht.datum)}<br>Betreff: ${escapeHtml(nachricht.betreff)}</p>`;

    const inhalt = zitatHtml
      ? `<div>${zitatHtml}</div>`
      : `<pre style="margin:0;white-space:pre-wrap;font-size:13px;color:#475569;">${escapeHtml(zitatText)}</pre>`;

    return `<br><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;"><tr><td style="border-left:3px solid #e2e8f0;padding-left:12px;color:#64748b;">${kopf}${inhalt}</td></tr></table>`;
  }

  async function abschicken() {
    if (!an || !betreff) return;
    setSenden(true);
    setFehler(null);

    let finalHtml = currentHtmlRef.current;
    const quote = quoteBlock();

    if (modus === "forward") {
      // Forwarded message first, then user's new text
      finalHtml = quote + (finalHtml ? `<br>${finalHtml}` : "");
    } else if (finalHtml.includes("</body>")) {
      finalHtml = finalHtml.replace("</body>", `${quote}</body>`);
    } else {
      finalHtml = finalHtml + quote;
    }

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: an, subject: betreff, html: finalHtml, text: zitatText }),
      });
      const d = await res.json();
      if (!res.ok) setFehler(d.fehler ?? t.postfach.fehlerSenden);
      else setGesendet(true);
    } catch {
      setFehler(t.common.netzwerkFehler);
    } finally {
      setSenden(false);
    }
  }

  const titel = modus === "reply" ? t.postfach.antworten : t.postfach.weiterleiten;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { backdropMouseDownRef.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && backdropMouseDownRef.current) onClose(); }}
    >
      <div className={`bg-card border border-divider rounded-2xl shadow-2xl w-full ${schritt === "compose" ? "max-w-2xl" : "max-w-lg"} max-h-[92vh] flex flex-col`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-divider shrink-0">
          <h2 className="font-semibold text-fg">{titel}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gesendet */}
        {gesendet ? (
          <div className="px-6 py-10 text-center space-y-3">
            <div className="text-3xl">✓</div>
            <p className="font-medium text-fg">{t.postfach.gesendet}</p>
            <button onClick={onClose} className="text-sm text-accent hover:underline">{t.postfach.schliessen}</button>
          </div>

        ) : schritt === "vorlage" ? (
          /* ── Vorlage wählen ── */
          <div className="p-4 space-y-2 overflow-y-auto">
            {vorlagenLaden ? (
              <div className="py-8 text-center text-sm text-muted">{t.postfach.ladeVorlagen}</div>
            ) : (
              <>
                {vorlagen.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => vorlaegWaehlen(v)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-divider bg-card hover:bg-elevated transition-colors"
                  >
                    <div className="font-medium text-sm text-fg">{v.name}</div>
                    {v.beschreibung && <div className="text-xs text-muted mt-0.5">{v.beschreibung}</div>}
                    <div className="text-xs text-subtle mt-0.5">{t.postfach.betreff}: {v.betreff}</div>
                  </button>
                ))}
                <button
                  onClick={() => vorlaegWaehlen({ id: "leer", name: "Leer", beschreibung: null, betreff: "", html: "" })}
                  className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-divider text-muted hover:bg-elevated transition-colors text-sm"
                >
                  {t.postfach.ohneVorlage}
                </button>
              </>
            )}
          </div>

        ) : (
          /* ── Compose ── */
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">

            {/* Meta */}
            <div className="px-6 pt-4 pb-3 space-y-3 shrink-0">
              <button
                onClick={() => setSchritt("vorlage")}
                className="flex items-center gap-1 text-xs text-muted hover:text-fg transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                {t.postfach.vorlageAendern}
                {vorlage && vorlage.id !== "leer" && <span className="ml-1 text-accent">({vorlage.name})</span>}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">{t.postfach.empfaenger}</label>
                  <EmpfaengerInput value={an} onChange={setAn} vorschlaege={benutzerEmails} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">{t.postfach.betreff}</label>
                  <input
                    type="text"
                    value={betreff}
                    onChange={(e) => setBetreff(e.target.value)}
                    className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
            </div>

            {htmlForIframe && (
              <div className="px-6 pb-2 shrink-0 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted shrink-0">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                <p className="text-xs text-muted">{t.postfach.bearbeitenHinweis}</p>
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 overflow-auto px-6 pb-2 min-h-0 space-y-3">
              {/* Forward: original message first */}
              {modus === "forward" && (zitatHtml || zitatText) && (
                <div className="border-l-2 border-divider pl-3">
                  <p className="text-xs text-subtle mb-1">
                    {t.postfach.weitergeleitet} {nachricht.von}
                  </p>
                  {zitatHtml ? (
                    <iframe
                      srcDoc={zitatHtml}
                      sandbox="allow-same-origin"
                      className="w-full border-0 rounded"
                      style={{ height: "160px", pointerEvents: "none" }}
                      title="Originalnachricht"
                    />
                  ) : (
                    <pre className="text-xs text-muted whitespace-pre-wrap max-h-32 overflow-y-auto">{zitatText}</pre>
                  )}
                </div>
              )}

              {htmlForIframe ? (
                <div className="rounded-xl overflow-hidden border border-divider bg-[#f0f2f7]">
                  <iframe
                    key={vorlage?.id ?? "leer"}
                    srcDoc={htmlForIframe}
                    sandbox="allow-scripts"
                    title={t.postfach.originalNachricht}
                    className="w-full border-0 block"
                    style={{ height: "400px" }}
                  />
                </div>
              ) : (
                <textarea
                  onChange={(e) => { currentHtmlRef.current = e.target.value; }}
                  rows={8}
                  placeholder={modus === "forward" ? t.postfach.optionaleNachricht : t.postfach.ihreNachricht}
                  className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
                />
              )}

              {/* Reply: original message below */}
              {modus === "reply" && (zitatHtml || zitatText) && (
                <div className="border-l-2 border-divider pl-3">
                  <p className="text-xs text-subtle mb-1">
                    {t.postfach.amSchrieb} {formatDatum(nachricht.datum, dateLocale)} {t.postfach.schrieb} {nachricht.von}:
                  </p>
                  {zitatHtml ? (
                    <iframe
                      srcDoc={zitatHtml}
                      sandbox="allow-same-origin"
                      className="w-full border-0 rounded"
                      style={{ height: "120px", pointerEvents: "none" }}
                      title={t.postfach.originalNachricht}
                    />
                  ) : (
                    <pre className="text-xs text-muted whitespace-pre-wrap max-h-24 overflow-y-auto">{zitatText}</pre>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 shrink-0 space-y-2 border-t border-divider pt-4">
              {fehler && <p className="text-sm text-red-600 dark:text-red-400">{fehler}</p>}
              <button
                onClick={abschicken}
                disabled={senden || !an || !betreff}
                className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {senden ? t.postfach.wirdGesendet : t.postfach.senden}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── EmailSendenModal (neue E-Mail) ────────────────────────────────────────────

function EmailSendenModal({
  benutzerEmails,
  onClose,
}: {
  benutzerEmails: string[];
  onClose: () => void;
}) {
  const t = useT();
  const [schritt, setSchritt] = useState<"vorlage" | "compose">("vorlage");
  const [vorlage, setVorlage] = useState<EmailVorlage | null>(null);
  const [vorlagen, setVorlagen] = useState<EmailVorlage[]>([]);
  const [vorlagenLaden, setVorlagenLaden] = useState(true);
  const [an, setAn] = useState(benutzerEmails[0] ?? "");
  const [betreff, setBetreff] = useState("");
  const [htmlForIframe, setHtmlForIframe] = useState("");
  const currentHtmlRef = useRef("");
  const backdropMouseDownRef = useRef(false);
  const [senden, setSenden] = useState(false);
  const [gesendet, setGesendet] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/email/vorlagen")
      .then((r) => r.json())
      .then((d) => setVorlagen(d.vorlagen ?? []))
      .catch(() => {})
      .finally(() => setVorlagenLaden(false));
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "html-update") {
        currentHtmlRef.current = e.data.html as string;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function vorlaegWaehlen(v: EmailVorlage) {
    currentHtmlRef.current = v.html;
    setVorlage(v);
    setBetreff(v.betreff);
    setHtmlForIframe(
      v.html ? injectEditScript(v.html, window.location.origin) : ""
    );
    setSchritt("compose");
  }

  async function abschicken() {
    if (!an || !betreff) return;
    setSenden(true);
    setFehler(null);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: an,
          subject: betreff,
          html: currentHtmlRef.current,
          text: "",
        }),
      });
      const d = await res.json();
      if (!res.ok) setFehler(d.fehler ?? t.postfach.fehlerSenden);
      else setGesendet(true);
    } catch {
      setFehler(t.common.netzwerkFehler);
    } finally {
      setSenden(false);
    }
  }

  const isCompose = schritt === "compose";

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { backdropMouseDownRef.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && backdropMouseDownRef.current) onClose(); }}
    >
      <div
        className={`bg-card border border-divider rounded-2xl shadow-2xl w-full ${
          isCompose ? "max-w-2xl" : "max-w-lg"
        } max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-divider shrink-0">
          <h2 className="font-semibold text-fg">
            {schritt === "vorlage" ? t.postfach.vorlageWaehlen : t.postfach.emailSchreiben}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-fg transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {gesendet ? (
          <div className="px-6 py-10 text-center space-y-3">
            <div className="text-3xl">✓</div>
            <p className="font-medium text-fg">{t.postfach.gesendet}</p>
            <button
              onClick={onClose}
              className="text-sm text-accent hover:underline"
            >
              {t.postfach.schliessen}
            </button>
          </div>
        ) : schritt === "vorlage" ? (
          <div className="p-4 space-y-2 overflow-y-auto">
            {vorlagenLaden ? (
              <div className="py-8 text-center text-sm text-muted">
                {t.postfach.ladeVorlagen}
              </div>
            ) : vorlagen.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-muted">{t.postfach.keineVorlagen}</p>
                <a
                  href="/admin/einstellungen"
                  target="_blank"
                  className="text-xs text-accent hover:underline"
                >
                  {t.postfach.vorlagenLink}
                </a>
              </div>
            ) : (
              <>
                {vorlagen.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => vorlaegWaehlen(v)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-divider bg-card hover:bg-elevated transition-colors"
                  >
                    <div className="font-medium text-sm text-fg">{v.name}</div>
                    {v.beschreibung && (
                      <div className="text-xs text-muted mt-0.5">
                        {v.beschreibung}
                      </div>
                    )}
                    <div className="text-xs text-subtle mt-0.5">
                      {t.postfach.betreff}: {v.betreff}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() =>
                    vorlaegWaehlen({
                      id: "leer",
                      name: "Leer",
                      beschreibung: null,
                      betreff: "",
                      html: "",
                    })
                  }
                  className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-divider text-muted hover:bg-elevated transition-colors text-sm"
                >
                  {t.postfach.ohneVorlage}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="px-6 pt-4 pb-3 space-y-3 shrink-0">
              <button
                onClick={() => setSchritt("vorlage")}
                className="flex items-center gap-1 text-xs text-muted hover:text-fg transition-colors"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                {t.postfach.vorlageAendern}
                {vorlage && vorlage.id !== "leer" && (
                  <span className="ml-1 text-accent">({vorlage.name})</span>
                )}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">
                    {t.postfach.empfaenger}
                  </label>
                  <EmpfaengerInput
                    value={an}
                    onChange={setAn}
                    vorschlaege={benutzerEmails}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">
                    {t.postfach.betreff}
                  </label>
                  <input
                    type="text"
                    value={betreff}
                    onChange={(e) => setBetreff(e.target.value)}
                    placeholder={t.postfach.betreffEingeben}
                    className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>
              </div>
            </div>
            {htmlForIframe && (
              <div className="px-6 pb-2 shrink-0 flex items-center gap-1.5">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <p className="text-xs text-muted">
                  {t.postfach.vorlagenHinweis}
                </p>
              </div>
            )}
            <div className="flex-1 overflow-auto px-6 pb-4 min-h-0">
              {htmlForIframe ? (
                <div className="rounded-xl overflow-hidden border border-divider bg-[#f0f2f7]">
                  <iframe
                    key={vorlage?.id ?? "leer"}
                    srcDoc={htmlForIframe}
                    sandbox="allow-scripts"
                    title={t.postfach.originalNachricht}
                    className="w-full border-0 block"
                    style={{ height: "520px" }}
                  />
                </div>
              ) : (
                <textarea
                  defaultValue=""
                  onChange={(e) => {
                    currentHtmlRef.current = e.target.value;
                  }}
                  rows={10}
                  placeholder={t.postfach.nachrichtEingeben}
                  className="w-full bg-elevated border border-divider rounded-xl px-3 py-2 text-sm text-fg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-y"
                />
              )}
            </div>
            <div className="px-6 pb-6 shrink-0 space-y-3 border-t border-divider pt-4">
              {fehler && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fehler}
                </p>
              )}
              <button
                onClick={abschicken}
                disabled={senden || !an || !betreff}
                className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {senden ? t.postfach.wirdGesendet : t.postfach.emailSenden}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── NachrichtDetail ───────────────────────────────────────────────────────────

function NachrichtDetail({
  nachricht,
  onZurueck,
  benutzerEmails,
  markierung,
  onMarkierung,
}: {
  nachricht: Nachricht;
  onZurueck: () => void;
  benutzerEmails: string[];
  markierung: string | null;
  onMarkierung: (color: string | null) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [content, setContent] = useState<{
    html: string;
    text: string;
    isHtml: boolean;
  } | null>(null);
  const [laden, setLaden] = useState(true);
  const [farbPickerOffen, setFarbPickerOffen] = useState(false);
  const [antwortenOffen, setAntwortenOffen] = useState(false);
  const [weiterleitenOffen, setWeiterleitenOffen] = useState(false);
  const farbPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLaden(true);
    fetch(`/api/email/nachricht/${nachricht.id}`)
      .then((r) => r.json())
      .then((d) =>
        setContent({
          html: d.html ?? "",
          text: d.text ?? "",
          isHtml: d.isHtml ?? false,
        })
      )
      .finally(() => setLaden(false));
  }, [nachricht.id]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        farbPickerRef.current &&
        !farbPickerRef.current.contains(e.target as Node)
      )
        setFarbPickerOffen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function handleMarkierung(color: string | null) {
    onMarkierung(color);
    setFarbPickerOffen(false);
  }

  const markFarbe = MARK_FARBEN.find((f) => f.hex === markierung);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onZurueck}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t.postfach.zurueck}
        </button>

        <div className="flex items-center gap-1.5">
          {/* Markieren */}
          <div ref={farbPickerRef} className="relative">
            <button
              onClick={() => setFarbPickerOffen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-divider bg-card text-muted hover:text-fg transition-colors"
              style={
                markierung
                  ? {
                      borderColor: markierung + "80",
                      boxShadow: `0 0 8px ${markierung}40`,
                      color: markierung,
                    }
                  : undefined
              }
            >
              {markierung ? (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: markierung }}
                />
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
              {markFarbe ? markFarbe.label : t.postfach.markieren}
            </button>
            {farbPickerOffen && (
              <FarbPicker aktive={markierung} onChange={handleMarkierung} />
            )}
          </div>

          {/* Weiterleiten */}
          <button
            onClick={() => setWeiterleitenOffen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-divider bg-card text-muted hover:text-fg transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
            {t.postfach.weiterleiten}
          </button>

          {/* Antworten */}
          <button
            onClick={() => setAntwortenOffen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            {t.postfach.antworten}
          </button>
        </div>
      </div>

      {/* Metadaten */}
      <div
        className="bg-card border rounded-xl px-4 py-3 space-y-1"
        style={
          markierung
            ? {
                borderColor: markierung + "60",
                boxShadow: `0 0 16px ${markierung}25`,
              }
            : undefined
        }
      >
        <h3 className="font-medium text-fg text-base">
          {nachricht.betreff || t.postfach.keinBetreff}
        </h3>
        <div className="text-xs text-muted flex flex-wrap gap-x-4 gap-y-0.5">
          <span>{t.postfach.vonLabel} {nachricht.von}</span>
          <span>{t.postfach.anLabel} {nachricht.an}</span>
          <span>{formatDatum(nachricht.datum, dateLocale)}</span>
        </div>
      </div>

      {/* Inhalt */}
      {laden ? (
        <div className="flex items-center justify-center py-16 text-muted text-sm">
          {t.postfach.emailLaden}
        </div>
      ) : content?.isHtml && content.html ? (
        <div className="bg-card border border-divider rounded-xl overflow-hidden">
          <iframe
            srcDoc={content.html}
            className="w-full min-h-[500px] border-0"
            sandbox="allow-same-origin"
            title="E-Mail Inhalt"
          />
        </div>
      ) : content?.text ? (
        <div className="bg-card border border-divider rounded-xl px-5 py-4">
          <pre className="whitespace-pre-wrap text-sm text-fg font-sans leading-relaxed">
            {content.text}
          </pre>
        </div>
      ) : (
        <div className="text-muted text-sm py-8 text-center">
          {t.postfach.keinInhalt}
        </div>
      )}

      {/* Modals */}
      {antwortenOffen && (
        <AntwortModal
          modus="reply"
          nachricht={nachricht}
          zitatHtml={content?.isHtml ? (content.html ?? "") : ""}
          zitatText={content?.text ?? ""}
          benutzerEmails={benutzerEmails}
          onClose={() => setAntwortenOffen(false)}
        />
      )}
      {weiterleitenOffen && (
        <AntwortModal
          modus="forward"
          nachricht={nachricht}
          zitatHtml={content?.isHtml ? (content.html ?? "") : ""}
          zitatText={content?.text ?? ""}
          benutzerEmails={benutzerEmails}
          onClose={() => setWeiterleitenOffen(false)}
        />
      )}
    </div>
  );
}

// ── PostfachTab ───────────────────────────────────────────────────────────────

export default function PostfachTab({ kundenprofilId }: { kundenprofilId: string }) {
  const t = useT();
  const { lang } = useLang();
  const dateLocale = lang === "de" ? "de-DE" : "en-GB";
  const [nachrichten, setNachrichten] = useState<Nachricht[]>([]);
  const [benutzerEmails, setBenutzerEmails] = useState<string[]>([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [filterEmail, setFilterEmail] = useState<string | null>(null);
  const [ausgewaehlt, setAusgewaehlt] = useState<Nachricht | null>(null);
  const [sendenOffen, setSendenOffen] = useState(false);
  const [markierungen, setMarkierungen] = useState<Record<string, string>>({});

  // Markierungen aus localStorage laden
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MARK_KEY);
      if (raw) setMarkierungen(JSON.parse(raw));
    } catch {}
  }, []);

  function setMarkierung(id: string, color: string | null) {
    setMarkierungen((prev) => {
      const next = { ...prev };
      if (color) next[id] = color;
      else delete next[id];
      try {
        localStorage.setItem(MARK_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const laden_ = useCallback(async () => {
    setLaden(true);
    setFehler(null);
    try {
      const res = await fetch(
        `/api/email/postfach?kundenprofilId=${kundenprofilId}`
      );
      const d = await res.json();
      if (!res.ok) setFehler(d.fehler ?? t.postfach.fehlerLaden);
      else {
        setNachrichten(d.nachrichten ?? []);
        setBenutzerEmails(d.benutzerEmails ?? []);
      }
    } catch {
      setFehler(t.common.netzwerkFehler);
    } finally {
      setLaden(false);
    }
  }, [kundenprofilId]);

  useEffect(() => {
    laden_();
  }, [laden_]);

  const gefiltert = filterEmail
    ? nachrichten.filter((n) => n.zugehoerigeEmail === filterEmail)
    : nachrichten;

  if (ausgewaehlt) {
    return (
      <NachrichtDetail
        nachricht={ausgewaehlt}
        onZurueck={() => setAusgewaehlt(null)}
        benutzerEmails={benutzerEmails}
        markierung={markierungen[ausgewaehlt.id] ?? null}
        onMarkierung={(color) => setMarkierung(ausgewaehlt.id, color)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterEmail(null)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
              filterEmail === null
                ? "bg-accent text-white border-accent"
                : "border-divider text-muted hover:text-fg bg-card"
            }`}
          >
            {t.postfach.alle} ({nachrichten.length})
          </button>
          {benutzerEmails.map((email) => {
            const anzahl = nachrichten.filter(
              (n) => n.zugehoerigeEmail === email
            ).length;
            return (
              <button
                key={email}
                onClick={() => setFilterEmail(email)}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  filterEmail === email
                    ? "bg-accent text-white border-accent"
                    : "border-divider text-muted hover:text-fg bg-card"
                }`}
              >
                {emailKurz(email)} ({anzahl})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={laden_}
            disabled={laden}
            className="text-xs text-muted hover:text-fg transition-colors flex items-center gap-1"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={laden ? "animate-spin" : ""}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </button>
          <button
            onClick={() => setSendenOffen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
            {t.postfach.emailSenden}
          </button>
        </div>
      </div>

      {/* States */}
      {laden && nachrichten.length === 0 && (
        <div className="flex items-center justify-center py-16 text-muted text-sm">
          {t.postfach.laden}
        </div>
      )}
      {fehler && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {fehler}
        </div>
      )}
      {!laden && !fehler && gefiltert.length === 0 && (
        <div className="text-center py-16 text-muted text-sm">
          {filterEmail
            ? `${t.postfach.keineEmailsVon} ${filterEmail}.`
            : t.postfach.keineEmails}
        </div>
      )}

      {/* Liste */}
      <div className="space-y-1">
        {gefiltert.map((n) => {
          const markierung = markierungen[n.id] ?? null;
          return (
            <button
              key={n.id}
              onClick={() => setAusgewaehlt(n)}
              className="w-full text-left px-4 py-3 rounded-xl border bg-card hover:bg-elevated transition-colors"
              style={
                markierung
                  ? {
                      borderColor: markierung + "70",
                      boxShadow: `0 0 12px ${markierung}28`,
                    }
                  : { borderColor: "var(--color-divider)" }
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {markierung ? (
                    <span
                      className="shrink-0 w-2 h-2 rounded-full mt-0.5"
                      style={{ backgroundColor: markierung }}
                    />
                  ) : (
                    istUngelesen(n.labelIds) && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-accent mt-0.5" />
                    )
                  )}
                  <span
                    className={`text-sm truncate ${
                      istUngelesen(n.labelIds)
                        ? "font-semibold text-fg"
                        : "font-medium text-fg"
                    }`}
                  >
                    {absenderName(n.von)}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {formatDatum(n.datum, dateLocale)}
                </span>
              </div>
              <div
                className={`text-sm mt-0.5 truncate ${
                  istUngelesen(n.labelIds) ? "text-fg" : "text-muted"
                }`}
              >
                {n.betreff || t.postfach.keinBetreff}
              </div>
              <div className="text-xs text-muted truncate mt-0.5">
                {n.snippet}
              </div>
            </button>
          );
        })}
      </div>

      {sendenOffen && (
        <EmailSendenModal
          benutzerEmails={benutzerEmails}
          onClose={() => setSendenOffen(false)}
        />
      )}
    </div>
  );
}

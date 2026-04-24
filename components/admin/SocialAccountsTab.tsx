"use client";

import { useState, useEffect, useTransition } from "react";

type SocialAccount = {
  id: string;
  plattform: string;
  accountId: string;
  accountName: string | null;
  accountHandle: string | null;
  tokenExpiry: string | null;
  syncedAt: string | null;
  createdAt: string;
};

type SyncResult = { accountId: string; success: boolean; error?: string; follower?: number; reach?: number };

export default function SocialAccountsTab({ kundenprofilId }: { kundenprofilId: string }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [meldung, setMeldung] = useState<{ text: string; ok: boolean } | null>(null);
  const [deletePending, startDelete] = useTransition();

  useEffect(() => {
    fetch(`/api/social/${kundenprofilId}/accounts`)
      .then(r => r.json())
      .then(data => { setAccounts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [kundenprofilId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialParam = params.get("social");
    if (socialParam === "success") {
      setMeldung({ text: "Instagram-Account erfolgreich verbunden!", ok: true });
    } else if (socialParam === "error") {
      setMeldung({ text: "Verbindung fehlgeschlagen — bitte erneut versuchen.", ok: false });
    } else if (socialParam === "kein-business-account") {
      setMeldung({ text: "Kein Instagram Business-Konto gefunden. Das Profil muss ein Business- oder Creator-Konto sein.", ok: false });
    }
    if (socialParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("social");
      url.searchParams.delete("tab");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  async function handleSync() {
    setSyncing(true);
    setMeldung(null);
    try {
      const res = await fetch(`/api/social/${kundenprofilId}/sync`, { method: "POST" });
      const data = await res.json();
      const results: SyncResult[] = data.results ?? [];
      const ok = results.filter(r => r.success).length;
      const fail = results.filter(r => !r.success).length;
      if (fail > 0) {
        setMeldung({ text: `${ok} synchronisiert, ${fail} fehlgeschlagen. KPIs wurden aktualisiert.`, ok: ok > 0 });
      } else {
        setMeldung({ text: `${ok} Account${ok !== 1 ? "s" : ""} synchronisiert — KPIs wurden aktualisiert.`, ok: true });
      }
      const updated = await fetch(`/api/social/${kundenprofilId}/accounts`).then(r => r.json());
      setAccounts(Array.isArray(updated) ? updated : []);
    } catch {
      setMeldung({ text: "Sync fehlgeschlagen.", ok: false });
    } finally {
      setSyncing(false);
    }
  }

  function handleDelete(id: string) {
    if (!confirm("Account wirklich trennen?")) return;
    startDelete(async () => {
      const res = await fetch(`/api/social/accounts/${id}`, { method: "DELETE" });
      if (res.ok) setAccounts(prev => prev.filter(a => a.id !== id));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-fg">Social Media Konten</h2>
          <p className="text-sm text-muted mt-0.5">
            Verbinde Accounts um Follower, Reichweite und KPIs automatisch zu synchronisieren.
          </p>
        </div>
        {accounts.length > 0 && (
          <button
            onClick={handleSync}
            disabled={syncing || deletePending}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
          >
            {syncing ? (
              <>
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                Wird synchronisiert…
              </>
            ) : (
              "↺ Jetzt synchronisieren"
            )}
          </button>
        )}
      </div>

      {meldung && (
        <div className={`rounded-xl px-4 py-3 text-sm ${meldung.ok ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>
          {meldung.text}
        </div>
      )}

      {loading ? (
        <div className="text-muted text-sm py-8 text-center">Lädt…</div>
      ) : accounts.length === 0 ? (
        <div className="glass-modal rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-fg font-semibold mb-1">Noch kein Account verbunden</p>
          <p className="text-muted text-sm mb-7 max-w-sm mx-auto">
            Verbinde einen Instagram Business-Account um Follower, Reichweite und Top-Posts automatisch in die KPIs zu übertragen.
          </p>
          <a
            href={`/api/social/meta/connect?kundenprofilId=${kundenprofilId}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20"
          >
            <span>📷</span> Instagram verbinden
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map(account => {
            const isExpiringSoon = account.tokenExpiry
              ? new Date(account.tokenExpiry).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
              : false;

            return (
              <div key={account.id} className="glass-modal rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    IG
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-fg text-sm truncate">
                      {account.accountName ?? account.accountHandle ?? account.accountId}
                    </p>
                    {account.accountHandle && (
                      <p className="text-xs text-muted">@{account.accountHandle}</p>
                    )}
                    <p className="text-xs text-subtle mt-0.5">
                      {account.syncedAt
                        ? `Synchronisiert: ${new Date(account.syncedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}`
                        : "Noch nicht synchronisiert"}
                    </p>
                    {isExpiringSoon && (
                      <p className="text-xs text-orange-500 mt-0.5">⚠ Token läuft bald ab — erneut verbinden</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                    Verbunden
                  </span>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletePending}
                    className="text-muted hover:text-red-500 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Trennen
                  </button>
                </div>
              </div>
            );
          })}

          <a
            href={`/api/social/meta/connect?kundenprofilId=${kundenprofilId}`}
            className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-divider hover:border-accent/50 rounded-2xl py-3 text-sm text-muted hover:text-accent transition-colors"
          >
            + Weiteren Account verbinden
          </a>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
        <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-2">Was wird synchronisiert?</p>
        <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-1">
          <li>• Follower-Anzahl, Reichweite, Impressionen (letzte 30 Tage)</li>
          <li>• Profilaufrufe</li>
          <li>• Top-Beitrag des Monats (Likes + Kommentare)</li>
          <li>• Daten werden automatisch in die KPI-Ansicht eingetragen</li>
        </ul>
      </div>
    </div>
  );
}

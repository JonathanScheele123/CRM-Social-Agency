"use client";

import { useState } from "react";

function driveFileId(url: string): string | null {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  return m ? m[1] : null;
}

function detectTyp(url: string, mimeType?: string): "bild" | "video" | "pdf" | "drive" | "sonstiges" {
  const lower = url.toLowerCase();
  if (mimeType?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg|avif)(\?|$)/.test(lower)) return "bild";
  if (mimeType?.startsWith("video/") || /\.(mp4|webm|mov|avi)(\?|$)/.test(lower)) return "video";
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (driveFileId(url)) return "drive";
  return "sonstiges";
}

type Props = {
  url: string;
  mimeType?: string;
  /** true = in DriveTab (uses proxy), false/undefined = shared link */
  proxyModus?: boolean;
};

export default function DateizugriffVorschau({ url, mimeType, proxyModus }: Props) {
  const [offen, setOffen] = useState(false);

  const fileId = driveFileId(url);
  const typ = detectTyp(url, mimeType);

  const iframeSrc = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : url;

  const proxySrc = fileId && proxyModus
    ? `/api/admin/drive/thumbnail?fileId=${fileId}`
    : null;

  const bildSrc = proxySrc ?? (typ === "bild" ? url : null);

  return (
    <div className="mt-1">
      {/* Link + Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          ↗ Datei öffnen
        </a>
        <button
          onClick={() => setOffen(v => !v)}
          className="text-xs text-muted hover:text-fg border border-divider hover:border-accent px-2 py-0.5 rounded-lg transition-colors"
        >
          {offen ? "Vorschau ausblenden" : "Vorschau"}
        </button>
      </div>

      {/* Preview */}
      {offen && (
        <div className="mt-2 rounded-xl overflow-hidden border border-divider bg-elevated">
          {typ === "bild" && bildSrc ? (
            <img
              src={bildSrc}
              alt="Vorschau"
              className="max-h-64 w-full object-contain bg-elevated/50"
            />
          ) : typ === "video" && !fileId ? (
            <video
              src={url}
              controls
              className="max-h-64 w-full"
            />
          ) : (typ === "pdf" || typ === "drive" || typ === "video") ? (
            <div className="aspect-video">
              <iframe
                src={iframeSrc}
                title="Vorschau"
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-subtle text-sm">
              Vorschau für diesen Dateityp nicht verfügbar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

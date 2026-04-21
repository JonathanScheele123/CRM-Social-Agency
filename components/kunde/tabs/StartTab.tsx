"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";

function videoEmbedUrl(url: string): { type: "iframe" | "video"; src: string } | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { type: "video", src: url };
  return null;
}

function FaqItem({ frage }: { frage: string }) {
  const t = useT();
  const [offen, setOffen] = useState(false);
  return (
    <div className="bg-card border border-divider rounded-2xl overflow-hidden">
      <button
        onClick={() => setOffen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-fg hover:bg-elevated transition-colors"
      >
        {frage}
        <span className={`text-muted text-xs transition-transform duration-200 ${offen ? "rotate-180" : ""}`}>▼</span>
      </button>
      {offen && (
        <div className="px-5 pb-4 pt-3 text-sm text-muted border-t border-divider">
          {t.startTab.inhaltFolgt}
        </div>
      )}
    </div>
  );
}

export default function StartTab({
  videoUrl,
  faqItems,
  globalFaqItems,
}: {
  videoUrl?: string | null;
  faqItems?: string[];
  globalFaqItems?: string[];
}) {
  const t = useT();
  const DEFAULT_FAQ_ITEMS = [
    t.startTab.faq1, t.startTab.faq2, t.startTab.faq3, t.startTab.faq4, t.startTab.faq5,
  ];
  const fragen =
    faqItems && faqItems.length > 0
      ? faqItems
      : globalFaqItems && globalFaqItems.length > 0
      ? globalFaqItems
      : DEFAULT_FAQ_ITEMS;
  const embed = videoUrl ? videoEmbedUrl(videoUrl) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="font-semibold text-fg mb-1">{t.startTab.titel}</h2>
        <p className="text-muted text-sm mb-4">{t.startTab.untertitel}</p>
        <div className="glass-modal rounded-2xl overflow-hidden border border-divider shadow-sm video-zoom-in">
          {embed ? (
            embed.type === "iframe" ? (
              <div className="aspect-video">
                <iframe
                  src={embed.src}
                  title={t.startTab.einfuehrungsvideo}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video">
                <video src={embed.src} controls className="w-full h-full object-cover" />
              </div>
            )
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-elevated/50">
              <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                <span className="text-accent text-xl pl-0.5">▶</span>
              </div>
              <p className="text-muted text-sm">{t.startTab.videoFolgt}</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-fg mb-4">{t.startTab.haeufigeFragen}</h2>
        <div className="space-y-2">
          {fragen.map((frage, i) => (
            <FaqItem key={i} frage={frage} />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const THRESHOLD = 72;

export default function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [pullDist, setPullDist] = useState(0);
  const [releasing, setReleasing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);
  const distRef = useRef(0);

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      startY.current = 0;
      active.current = false;
      if (window.scrollY !== 0) return;
      startY.current = e.touches[0].clientY;
      active.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!active.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        const d = Math.min(dy, THRESHOLD + 24);
        distRef.current = d;
        setPullDist(d);
      }
    }

    function onTouchEnd() {
      if (!active.current) return;
      active.current = false;
      if (distRef.current >= THRESHOLD) {
        window.location.reload();
        return;
      }
      distRef.current = 0;
      setPullDist(0);
      setReleasing(true);
      setTimeout(() => setReleasing(false), 300);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const show = pullDist > 8;
  const ready = pullDist >= THRESHOLD;
  const shift = Math.min(pullDist * 0.38, 32);

  return (
    <div style={{ position: "relative" }}>
      {/* Indicator slides down from above */}
      <div
        className="absolute left-0 right-0 flex justify-center pointer-events-none"
        style={{
          top: -44,
          height: 44,
          transform: show ? `translateY(${Math.min(shift, 44)}px)` : "translateY(0)",
          transition: releasing ? "transform 0.25s ease" : undefined,
          opacity: show ? 1 : 0,
        }}
      >
        <div
          className={`self-center w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm transition-colors ${
            ready
              ? "border-accent bg-accent text-white"
              : "border-divider bg-card text-muted"
          }`}
        >
          <span
            style={{
              fontSize: 14,
              display: "block",
              transform: ready ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            ↓
          </span>
        </div>
      </div>

      {/* Content shifts down */}
      <div
        style={{
          transform: show ? `translateY(${shift}px)` : undefined,
          transition: releasing ? "transform 0.25s ease" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

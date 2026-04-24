"use client";

import { useEffect, useRef } from "react";

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const bands = [
      { color: [184, 149, 106] as [number,number,number], alpha: 0.055, amp: 55,  freq: 0.0018, speed: 0.00090, y: 0.30, phase: 0.0 },
      { color: [122, 92,  56 ] as [number,number,number], alpha: 0.045, amp: 70,  freq: 0.0014, speed: 0.00063, y: 0.48, phase: 1.8 },
      { color: [212, 176, 138] as [number,number,number], alpha: 0.040, amp: 45,  freq: 0.0022, speed: 0.00117, y: 0.62, phase: 3.4 },
      { color: [184, 149, 106] as [number,number,number], alpha: 0.035, amp: 60,  freq: 0.0016, speed: 0.00081, y: 0.20, phase: 5.1 },
      { color: [122, 92,  56 ] as [number,number,number], alpha: 0.030, amp: 40,  freq: 0.0026, speed: 0.00054, y: 0.75, phase: 2.6 },
      { color: [212, 176, 138] as [number,number,number], alpha: 0.025, amp: 80,  freq: 0.0011, speed: 0.00045, y: 0.10, phase: 4.2 },
    ];

    let t = 0;
    let rafId: number;

    function drawBand(w: typeof bands[0], W: number, H: number) {
      const [r, g, b] = w.color;
      const baseY = H * w.y;
      const step = 6;

      ctx!.beginPath();
      for (let x = 0; x <= W; x += step) {
        const y =
          baseY +
          Math.sin(x * w.freq + t * w.speed + w.phase) * w.amp +
          Math.sin(x * w.freq * 1.6 + t * w.speed * 0.7 + w.phase * 1.3) * (w.amp * 0.28);
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.lineTo(W, H);
      ctx!.lineTo(0, H);
      ctx!.closePath();

      const grad = ctx!.createLinearGradient(0, baseY - w.amp, 0, baseY + w.amp * 2.5);
      grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.25, `rgba(${r},${g},${b},${w.alpha})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx!.fillStyle = grad;
      ctx!.fill();
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);
      for (const w of bands) drawBand(w, W, H);
      t++;
      rafId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

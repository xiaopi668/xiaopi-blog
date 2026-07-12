"use client";

import { useEffect, useRef } from "react";

interface BlobState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  el: HTMLDivElement | null;
}

export function FloatingBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blobs: BlobState[] = [];
    const els = container.querySelectorAll<HTMLDivElement>("[data-blob]");

    els.forEach((el) => {
      blobs.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        el,
      });
    });

    let rafId: number;

    function tick() {
      for (const b of blobs) {
        b.vx += (Math.random() - 0.5) * 1.5;
        b.vy += (Math.random() - 0.5) * 1.5;
        b.vx = Math.max(-6, Math.min(6, b.vx));
        b.vy = Math.max(-6, Math.min(6, b.vy));
        b.x += b.vx;
        b.y += b.vy;
        b.x = Math.max(-300, Math.min(300, b.x));
        b.y = Math.max(-300, Math.min(300, b.y));
        if (b.el) {
          b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        data-blob
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-500/25 rounded-full blur-3xl transition-opacity duration-[3000ms]"
        style={{ opacity: 0.5 + Math.random() * 0.3 }}
      />
      <div
        data-blob
        className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-purple-500/20 rounded-full blur-3xl transition-opacity duration-[3000ms]"
        style={{ opacity: 0.4 + Math.random() * 0.3 }}
      />
      <div
        data-blob
        className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-3xl transition-opacity duration-[3000ms]"
        style={{ opacity: 0.3 + Math.random() * 0.3 }}
      />
      <div
        data-blob
        className="absolute top-2/3 right-1/4 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl transition-opacity duration-[3000ms]"
        style={{ opacity: 0.3 + Math.random() * 0.25 }}
      />
      <div
        data-blob
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        style={{ animation: "spin-slow 20s linear infinite" }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";

function apply(entries: { key: string; value: string }[]) {
  const obj: Record<string, string> = {};
  entries.forEach((s) => { obj[s.key] = s.value });

  const type = obj.backgroundType || "none";
  const value = obj.backgroundValue || "";
  const transparency = obj.glassTransparency || "50";
  const blur = obj.glassBlur || "50";
  const refraction = obj.glassRefraction || "50";
  const textColor = obj.textColor || "";

  const glassAlpha = Number(transparency) / 100;
  document.documentElement.style.setProperty("--glass-alpha", String(glassAlpha));
  const blurPx = Math.round(Number(blur) / 100 * 32);
  document.documentElement.style.setProperty("--glass-blur", `${blurPx}px`);
  document.documentElement.style.setProperty("--glass-refraction", refraction);

  if (textColor) {
    document.documentElement.style.setProperty("--text-color", textColor);
  } else {
    document.documentElement.style.removeProperty("--text-color");
  }

  if (type === "color" && value) {
    document.documentElement.style.setProperty("--bg-custom-color", value);
  }

  return { type, value };
}

export function BackgroundStyle() {
  const [bgStyle, setBgStyle] = useState("");

  const applyFromApi = useCallback(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: { key: string; value: string }[]) => {
        const { type, value } = apply(data);
        let style = "";
        if (type === "color" && value) {
          style = `background-color: ${value};`;
        } else if (type === "gradient" && value) {
          style = `background: ${value}; background-attachment: fixed;`;
        } else if (type === "image" && value) {
          style = `background-image: url(${value}); background-size: cover; background-attachment: fixed; background-position: center;`;
        }
        setBgStyle(style);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    applyFromApi();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Record<string, string>;
      const data = Object.entries(detail).map(([key, value]) => ({ key, value }));
      const { type, value } = apply(data);
      let style = "";
      if (type === "color" && value) {
        style = `background-color: ${value};`;
      } else if (type === "gradient" && value) {
        style = `background: ${value}; background-attachment: fixed;`;
      } else if (type === "image" && value) {
        style = `background-image: url(${value}); background-size: cover; background-attachment: fixed; background-position: center;`;
      }
      setBgStyle(style);
    };
    window.addEventListener("glass-settings-updated", handler);
    return () => window.removeEventListener("glass-settings-updated", handler);
  }, [applyFromApi]);

  return (
    <>
      {bgStyle ? (
        <style>{`
          body::after {
            content: "";
            position: fixed;
            inset: 0;
            z-index: -2;
            ${bgStyle}
          }
        `}</style>
      ) : (
        <style>{`
          body::after {
            content: "";
            position: fixed;
            inset: 0;
            z-index: -2;
            background:
              radial-gradient(ellipse 80% 60% at 0% 10%, hsl(239 84% 70% / 0.22) 0%, transparent 60%),
              radial-gradient(ellipse 60% 50% at 100% 20%, hsl(271 91% 70% / 0.18) 0%, transparent 60%),
              radial-gradient(ellipse 55% 45% at 50% 55%, hsl(239 84% 70% / 0.12) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 50% 80%, hsl(330 100% 75% / 0.16) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 30% 60%, hsl(190 100% 70% / 0.12) 0%, transparent 50%);
            background-blend-mode: normal;
          }
        `}</style>
      )}

      <style>{`
        :root {
          --text-color-initial: var(--color-foreground);
        }
        body {
          color: var(--text-color, var(--text-color-initial));
        }
      `}</style>
    </>
  );
}

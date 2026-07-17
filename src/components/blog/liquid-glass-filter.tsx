"use client";

import { useEffect, useRef } from "react";

function smoothStep(a: number, b: number, t: number) {
  t = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function length(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x: number, y: number, hw: number, hh: number, r: number) {
  const qx = Math.abs(x) - hw + r;
  const qy = Math.abs(y) - hh + r;
  return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

function generateMap(width: number, height: number): string {
  const w = Math.round(width);
  const h = Math.round(height);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const data = new Uint8ClampedArray(w * h * 4);

  let maxScale = 0;
  const raw: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const px = (i / 4) % w;
    const py = Math.floor(i / 4 / w);
    const uv = { x: px / w, y: py / h };

    const ix = uv.x - 0.5;
    const iy = uv.y - 0.5;
    const dist = roundedRectSDF(ix, iy, 0.45, 0.45, 0.1);
    const displacement = smoothStep(0.8, 0, dist - 0.05);
    const scaled = smoothStep(0, 1, displacement);
    const tx = ix * scaled + 0.5;
    const ty = iy * scaled + 0.5;

    const dx = tx * w - px;
    const dy = ty * h - py;
    maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
    raw.push(dx, dy);
  }

  maxScale *= 0.5;
  if (maxScale < 1e-6) maxScale = 1;

  let idx = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = raw[idx++] / maxScale + 0.5;
    const g = raw[idx++] / maxScale + 0.5;
    data[i] = r * 255;
    data[i + 1] = g * 255;
    data[i + 2] = 0;
    data[i + 3] = 255;
  }

  ctx.putImageData(new ImageData(data, w, h), 0, 0);
  return canvas.toDataURL();
}

function readCSSVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function scaleFromRefraction(raw: string): number {
  const refractVal = parseInt(raw, 10);
  const v = Number.isFinite(refractVal) ? refractVal : 50;
  // 0 → no displacement; 50 → ~27; 100 → ~52
  return Math.round(v * 0.5 + 2);
}

const FILTER_ID = "lg-edge";
const STYLE_ID = "lg-edge-style";
const SVG_ID = "lg-edge-svg";

function cleanup() {
  document.getElementById(STYLE_ID)?.remove();
  document.getElementById(SVG_ID)?.remove();
  document.getElementById(FILTER_ID)?.closest("svg")?.remove();
}

function supportsSvgBackdropFilter(): boolean {
  try {
    // Feature detect: browsers that accept url() in backdrop-filter
    const probe = document.createElement("div");
    probe.style.position = "fixed";
    probe.style.left = "-9999px";
    probe.style.width = "1px";
    probe.style.height = "1px";
    probe.style.backdropFilter = `url(#${FILTER_ID}) blur(1px)`;
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe) as CSSStyleDeclaration & { webkitBackdropFilter?: string };
    const computed = cs.backdropFilter || cs.webkitBackdropFilter || "";
    probe.remove();
    // If the browser drops the whole value, we get "none"
    return computed !== "none" && computed.length > 0;
  } catch {
    return false;
  }
}

function injectLiquidFilter() {
  cleanup();

  const rawRefract = readCSSVar("--glass-refraction", "50");
  const scale = scaleFromRefraction(rawRefract);
  const mapUrl = generateMap(128, 128);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.id = SVG_ID;
  svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
  svg.setAttribute("aria-hidden", "true");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", FILTER_ID);
  filter.setAttribute("filterUnits", "objectBoundingBox");
  filter.setAttribute("x", "-5%");
  filter.setAttribute("y", "-5%");
  filter.setAttribute("width", "110%");
  filter.setAttribute("height", "110%");
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const feImage = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
  feImage.setAttribute("id", FILTER_ID + "_map");
  feImage.setAttribute("result", FILTER_ID + "_map");
  feImage.setAttribute("width", "100%");
  feImage.setAttribute("height", "100%");
  feImage.setAttribute("preserveAspectRatio", "none");
  feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", mapUrl);
  feImage.setAttribute("href", mapUrl);

  const feDisp = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
  feDisp.setAttribute("id", FILTER_ID + "_disp");
  feDisp.setAttribute("in", "SourceGraphic");
  feDisp.setAttribute("in2", FILTER_ID + "_map");
  feDisp.setAttribute("xChannelSelector", "R");
  feDisp.setAttribute("yChannelSelector", "G");
  feDisp.setAttribute("scale", String(scale));

  filter.appendChild(feImage);
  filter.appendChild(feDisp);
  defs.appendChild(filter);
  svg.appendChild(defs);
  document.body.appendChild(svg);

  if (!supportsSvgBackdropFilter()) {
    cleanup();
    return false;
  }

  // Keep real blur from CSS vars — never crush to 0.25px
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent =
    ".glass,.glass-card{" +
    `backdrop-filter:url(#${FILTER_ID}) blur(var(--glass-blur, 24px)) saturate(1.6) brightness(1.15);` +
    `-webkit-backdrop-filter:url(#${FILTER_ID}) blur(var(--glass-blur, 24px)) saturate(1.6) brightness(1.15);` +
    "}";
  document.head.appendChild(style);
  return true;
}

function updateScale() {
  const disp = document.getElementById(FILTER_ID + "_disp");
  if (!disp) return;
  const rawRefract = readCSSVar("--glass-refraction", "50");
  disp.setAttribute("scale", String(scaleFromRefraction(rawRefract)));
}

/**
 * Full-site liquid edge refraction for .glass / .glass-card.
 * Base blur always lives in globals.css; this only adds optional SVG displacement.
 * If the browser rejects url() in backdrop-filter, we fall back silently.
 */
export function LiquidGlassFilter() {
  const activeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      activeRef.current = injectLiquidFilter();
    }, 80);

    const onSettings = () => {
      // CSS vars are updated by BackgroundStyle first; refresh scale
      if (activeRef.current) {
        updateScale();
      } else {
        activeRef.current = injectLiquidFilter();
      }
    };

    window.addEventListener("glass-settings-updated", onSettings);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      window.removeEventListener("glass-settings-updated", onSettings);
      cleanup();
      activeRef.current = false;
    };
  }, []);

  return null;
}

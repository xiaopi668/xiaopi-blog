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

    // SDF fragment shader (same as original)
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

const FILTER_ID = "lg-edge";

export function LiquidGlassFilter() {
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    let style: HTMLStyleElement | null = null;

    const timer = setTimeout(() => {
      const rawRefract = readCSSVar("--glass-refraction", "50");
      const refractVal = parseInt(rawRefract) || 50;

      // Use a fixed-size map that works with objectBoundingBox
      const mapUrl = generateMap(128, 128);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
      svg.setAttribute("aria-hidden", "true");

      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      filter.setAttribute("id", FILTER_ID);
      filter.setAttribute("filterUnits", "objectBoundingBox");
      filter.setAttribute("colorInterpolationFilters", "sRGB");

      // Same as original: feImage with id, referenced by feDisplacementMap's in2
      const feImage = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
      feImage.setAttribute("id", FILTER_ID + "_map");
      feImage.setAttribute("width", "100%");
      feImage.setAttribute("height", "100%");
      feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", mapUrl);

      const feDisp = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
      feDisp.setAttribute("in", "SourceGraphic");
      feDisp.setAttribute("in2", FILTER_ID + "_map");
      feDisp.setAttribute("xChannelSelector", "R");
      feDisp.setAttribute("yChannelSelector", "G");
      feDisp.setAttribute("scale", String(Math.round(refractVal * 0.5 + 2)));

      filter.appendChild(feImage);
      filter.appendChild(feDisp);
      defs.appendChild(filter);
      svg.appendChild(defs);
      document.body.appendChild(svg);

      // Inject CSS
      style = document.createElement("style");
      style.id = "lg-edge-style";
      style.textContent =
        ".glass,.glass-card{" +
        "backdrop-filter:url(#" + FILTER_ID + ") blur(0.25px) saturate(1.5) brightness(1.2) contrast(1.15) !important;" +
        "-webkit-backdrop-filter:url(#" + FILTER_ID + ") blur(0.25px) saturate(1.5) brightness(1.2) contrast(1.15) !important" +
        "}";
      document.head.appendChild(style);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (style) style.remove();
      const svgEl = document.getElementById(FILTER_ID)?.closest("svg");
      if (svgEl) svgEl.remove();
    };
  }, []);

  return null;
}

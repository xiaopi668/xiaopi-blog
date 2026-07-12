"use client";

import { useEffect, useRef } from "react";

export function LiquidGlassPane() {
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const script = document.createElement("script");
    script.src = "/liquid-glass.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      if ((window as any).liquidGlass) {
        (window as any).liquidGlass.destroy();
        delete (window as any).liquidGlass;
      }
    };
  }, []);

  return null;
}

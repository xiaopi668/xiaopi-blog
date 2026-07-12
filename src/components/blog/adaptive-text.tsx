"use client";

import { useEffect } from "react";

export function AdaptiveTextContrast() {
  useEffect(() => {
    function update() {
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        document.documentElement.style.setProperty("--glass-text", "hsl(0 0% 93%)");
        document.documentElement.style.setProperty("--glass-text-secondary", "hsl(0 0% 65%)");
      } else {
        document.documentElement.style.setProperty("--glass-text", "hsl(0 0% 9%)");
        document.documentElement.style.setProperty("--glass-text-secondary", "hsl(0 0% 40%)");
      }
    }
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  return null;
}

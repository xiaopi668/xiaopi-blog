"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundStyle } from "@/components/blog/background-style";
import { LiquidGlassFilter } from "@/components/blog/liquid-glass-filter";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <BackgroundStyle />
        <LiquidGlassFilter />
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </SessionProvider>
  );
}

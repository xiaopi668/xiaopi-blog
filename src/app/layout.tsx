import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "xiaopi'小窝",
  description: "分享技术、生活与思考",
};

const themeScript = `!function(){try{var e=localStorage.getItem("theme");var t=e||"system";var r=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(r);document.documentElement.style.colorScheme=r}catch(e){}}();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script id="theme-init" type="text/javascript" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

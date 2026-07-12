"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, Menu, X, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/tags", label: "标签" },
];

export function BlogHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b glass shadow-sm backdrop-blur-2xl"
          : "bg-transparent"
      )}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="gradient-text text-xl font-bold hover:opacity-80 transition-opacity"
        >
          xiaopi&apos;小窝
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 glass-card",
                pathname === link.href
                  ? "text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full glass-card"
              >
                {theme === "dark" ? <Sun size={16} className="animate-scale-in" /> : <Moon size={16} className="animate-scale-in" />}
              </Button>
            )}
            {session ? (
              <div className="flex items-center gap-1">
                <Link
                  href={session.user?.role === "admin" || session.user?.role === "editor" ? "/admin" : "/"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg glass-card text-muted-foreground hover:text-foreground"
                >
                  <User size={14} />
                  {session.user?.name}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="rounded-full glass-card text-muted-foreground hover:text-destructive"
                  title="退出登录"
                >
                  <LogOut size={14} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg glass-card text-muted-foreground hover:text-foreground"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg glass-card text-primary"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full hover:bg-accent/50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl animate-fade-in">
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:bg-accent/50"
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent/50 rounded-lg"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "浅色模式" : "深色模式"}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

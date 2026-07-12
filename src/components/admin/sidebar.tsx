"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Tags,
  Image,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/posts", label: "文章管理", icon: FileText },
  { href: "/admin/tags", label: "标签管理", icon: Tags, adminOnly: true },
  { href: "/admin/media", label: "媒体库", icon: Image, adminOnly: true },
  { href: "/admin/comments", label: "评论管理", icon: MessageSquare, adminOnly: true },
  { href: "/admin/users", label: "用户管理", icon: Users, adminOnly: true },
  { href: "/admin/settings", label: "站点设置", icon: Settings, adminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <aside className="fixed left-0 top-0 h-full w-60 border-r glass flex flex-col z-10">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          xiaopi&apos;小窝
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">管理后台</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.filter((item) => !item.adminOnly || isAdmin).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/20 text-primary glass-card"
                  : "text-muted-foreground hover:text-foreground glass-card"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link href="/" target="_blank">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
            <ExternalLink size={16} className="mr-2" />
            查看博客
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut size={16} className="mr-2" />
          退出登录
        </Button>
      </div>
    </aside>
  );
}

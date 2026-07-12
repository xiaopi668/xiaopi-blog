"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!username || !password) { toast.error("请输入用户名和密码"); return; }
    setLoading(true);
    const result = await signIn("credentials", { username, password, redirect: false });
    if (result?.ok) {
      router.replace("/admin");
    } else if (result?.error) {
      toast.error(result.error);
    } else {
      toast.error("用户名或密码错误");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />

      <div className="relative w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            xiaopi&apos;小窝
          </h1>
          <p className="text-indigo-300/80 text-sm">管理后台</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-indigo-200 text-sm">用户名</Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300/60" />
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                type="text"
                placeholder="请输入用户名"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-indigo-300/40 focus:border-indigo-400 focus:ring-indigo-400"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-indigo-200 text-sm">密码</Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300/60" />
              <Input
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="请输入密码"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-indigo-300/40 focus:border-indigo-400 focus:ring-indigo-400"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>
          <Button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 h-11 rounded-xl font-medium"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "登 录"}
          </Button>
        </div>

        <p className="text-center mt-6 text-indigo-400/50 text-xs">
          xiaopi&apos;小窝 &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

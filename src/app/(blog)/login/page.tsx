"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (!username || !password) { toast.error("请输入用户名和密码"); return; }
    setLoading(true);
    try {
      const result = await signIn("credentials", { username, password, redirect: false });
      if (result?.ok) {
        toast.success("登录成功");
        router.replace("/");
      } else if (result?.error) {
        toast.error(result.error);
      } else {
        toast.error("用户名或密码错误");
      }
    } catch (e) {
      toast.error("登录失败: " + (e instanceof Error ? e.message : "未知错误"));
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">登录</h1>
          <p className="text-muted-foreground text-sm">登录后即可发表评论</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">用户名</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="pl-10"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">密码</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="请输入密码"
                className="pl-10"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>
          <Button
            onClick={handleLogin}
            className="w-full h-11 rounded-xl"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "登 录"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            没有账号？
            <Link href="/register" className="text-primary hover:underline ml-1">去注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

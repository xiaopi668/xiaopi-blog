"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, User, Lock, UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    if (!username || !password) { toast.error("用户名和密码不能为空"); return; }
    if (username.length < 3) { toast.error("用户名长度至少 3 个字符"); return; }
    if (password.length < 6) { toast.error("密码长度至少 6 个字符"); return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), name: name.trim() || undefined, password }),
    });

    if (res.ok) {
      toast.success("注册成功，请登录");
      router.push("/login");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "注册失败");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">注册</h1>
          <p className="text-muted-foreground text-sm">创建你的账号</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">用户名</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="3-20 个字符"
                className="pl-10"
                onKeyDown={e => e.key === "Enter" && handleRegister()}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">昵称（可选）</label>
            <div className="relative">
              <UserPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="显示名称，默认为用户名"
                className="pl-10"
                onKeyDown={e => e.key === "Enter" && handleRegister()}
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
                placeholder="至少 6 个字符"
                className="pl-10"
                onKeyDown={e => e.key === "Enter" && handleRegister()}
              />
            </div>
          </div>
          <Button
            onClick={handleRegister}
            className="w-full h-11 rounded-xl"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "注 册"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？
            <Link href="/login" className="text-primary hover:underline ml-1">去登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

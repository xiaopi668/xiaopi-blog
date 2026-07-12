"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Shield, User as UserIcon } from "lucide-react";

interface User {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
  createdAt: string;
  _count: { posts: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "", role: "editor" });
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadUsers() }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("用户已创建");
      setForm({ username: "", name: "", email: "", password: "", role: "editor" });
      setShowForm(false);
      loadUsers();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "创建失败");
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除该用户？")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("用户已删除");
      loadUsers();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "删除失败");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" />
          添加用户
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 glass-card">
          <CardHeader>
            <CardTitle className="text-lg">新用户</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>用户名</Label>
                  <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>显示名称</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>邮箱</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>密码</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="admin">管理员</option>
                  <option value="editor">编辑</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
                创建
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>取消</Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="rounded-xl glass">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-medium">用户名</th>
              <th className="text-left p-4 font-medium hidden sm:table-cell">显示名称</th>
              <th className="text-left p-4 font-medium hidden md:table-cell">邮箱</th>
              <th className="text-left p-4 font-medium">角色</th>
              <th className="text-left p-4 font-medium hidden lg:table-cell">文章</th>
              <th className="text-right p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-4 font-medium">{user.username}</td>
                <td className="p-4 hidden sm:table-cell">{user.name}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell">{user.email ?? "-"}</td>
                <td className="p-4">
                  <Badge variant={user.role === "admin" ? "default" : user.role === "editor" ? "secondary" : "outline"}>
                    {user.role === "admin" ? <Shield size={12} className="mr-1 inline" /> : <UserIcon size={12} className="mr-1 inline" />}
                    {user.role === "admin" ? "管理员" : user.role === "editor" ? "编辑" : "用户"}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground hidden lg:table-cell">{user._count.posts}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

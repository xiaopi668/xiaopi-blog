"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadTags() {
    const res = await fetch("/api/tags");
    if (res.ok) setTags(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadTags() }, []);

  async function handleCreate() {
    if (!newTag.trim()) return;
    setCreating(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTag.trim() }),
    });
    if (res.ok) {
      toast.success("标签已创建");
      setNewTag("");
      loadTags();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "创建失败");
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除该标签？")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("标签已删除");
      loadTags();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "删除失败");
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">标签管理</h1>

      <Card className="mb-6 border-0 glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="新标签名称"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              添加
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-2xl glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">名称</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Slug</th>
              <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">文章数</th>
              <th className="text-right p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                <td className="p-4 font-medium">{tag.name}</td>
                <td className="p-4 text-muted-foreground">{tag.slug}</td>
                <td className="p-4">{tag._count.posts}</td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tag.id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && tags.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted-foreground">暂无标签</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

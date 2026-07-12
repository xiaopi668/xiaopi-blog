"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, MessageSquare, Trash2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
  post: { id: string; title: string; slug: string };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadComments() {
    const res = await fetch("/api/comments");
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadComments() }, []);

  async function handleDelete(commentId: string) {
    if (!confirm("确定删除该评论？")) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("已删除");
      loadComments();
    } else {
      toast.error("删除失败");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">评论管理</h1>
          <p className="text-sm text-muted-foreground mt-1">共 {comments.length} 条评论</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>暂无评论</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="glass-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                      {comment.user.name[0]}
                    </div>
                    <span className="text-sm font-medium">{comment.user.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(new Date(comment.createdAt))}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{comment.content}</p>
                  <div className="mt-2">
                    <Link
                      href={`/posts/${comment.post.slug}`}
                      target="_blank"
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      <ExternalLink size={10} />
                      来自：{comment.post.title}
                    </Link>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(comment.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

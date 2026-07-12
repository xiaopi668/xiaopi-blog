"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadComments() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadComments() }, [postId]);

  async function handleSubmit() {
    if (!content.trim()) return;
    if (!session && !guestName.trim()) { toast.error("请输入昵称"); return; }

    setSubmitting(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), guestName: session ? undefined : guestName.trim() }),
    });

    if (res.ok) {
      toast.success("评论成功");
      setContent("");
      loadComments();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "评论失败");
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    if (!confirm("确定删除该评论？")) return;
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("评论已删除");
      loadComments();
    } else {
      toast.error("删除失败");
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={20} className="text-primary" />
        <h3 className="text-lg font-bold">评论 ({comments.length})</h3>
      </div>

      {session && (
        <div className="mb-6 space-y-3 p-4 rounded-lg glass-card">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>
            {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
            发表评论
          </Button>
        </div>
      )}

      {!session && (
        <div className="mb-6 space-y-3 p-4 rounded-lg glass-card">
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="输入昵称（匿名评论）"
            className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            maxLength={20}
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={3}
          />
          <div className="flex items-center justify-between">
            <Button onClick={handleSubmit} disabled={submitting || !content.trim() || !guestName.trim()}>
              {submitting && <Loader2 size={16} className="mr-2 animate-spin" />}
              发表评论
            </Button>
            <div className="text-xs text-muted-foreground flex gap-2">
              <Link href="/register" className="text-primary hover:underline">注册</Link>
              <span>|</span>
              <Link href="/login" className="text-primary hover:underline">登录</Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-xl glass-card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                    {comment.user.name[0]}
                  </div>
                  <span className="text-sm font-medium">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(new Date(comment.createdAt))}</span>
                </div>
                {session?.user?.role === "admin" && (
                  <button onClick={() => handleDelete(comment.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          暂无评论，来写第一条吧
        </div>
      )}
    </div>
  );
}

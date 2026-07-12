"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Edit3, Trash2 } from "lucide-react";

export function PostActions({ postId, postAuthorId }: { postId: string; postAuthorId: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return null;

  const role = session.user?.role;
  const isAdmin = role === "admin";
  const isEditorOwnPost = role === "editor" && session.user?.id === postAuthorId;

  if (!isAdmin && !isEditorOwnPost) return null;

  async function handleDelete() {
    if (!confirm("确定删除该文章？")) return;
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("文章已删除");
      router.replace("/posts");
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "删除失败");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/admin/posts/${postId}`)}
        className="text-xs"
      >
        <Edit3 size={12} className="mr-1" />
        编辑
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="text-xs text-destructive hover:text-destructive"
      >
        <Trash2 size={12} className="mr-1" />
        删除
      </Button>
    </div>
  );
}

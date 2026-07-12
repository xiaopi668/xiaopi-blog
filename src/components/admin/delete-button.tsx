"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function DeleteButton({ postId, title }: { postId: string; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(`"${title}" 已删除`);
      router.refresh();
    } else {
      toast.error("删除失败");
    }
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="text-xs h-7 px-2"
        >
          确认
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          className="text-xs h-7 px-2"
        >
          取消
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setConfirming(true)}
      className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 size={12} className="mr-1" />
      删除
    </Button>
  );
}

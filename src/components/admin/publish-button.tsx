"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

export function PublishButton({ postId }: { postId: string }) {
  const router = useRouter();

  async function handlePublish() {
    const res = await fetch(`/api/posts/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });

    if (res.ok) {
      toast.success("文章已发布");
      router.refresh();
    } else {
      toast.error("发布失败");
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handlePublish}
      className="text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
    >
      <Send size={12} className="mr-1" />
      发布
    </Button>
  );
}

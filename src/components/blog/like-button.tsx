"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function LikeButton({ postId, initialLikes }: { postId: string; initialLikes: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    if (!session) {
      router.push("/admin/login");
      return;
    }

    setLoading(true);
    const method = liked ? "DELETE" : "POST";
    const res = await fetch(`/api/posts/${postId}/like`, { method });

    if (res.ok) {
      setLikes(liked ? likes - 1 : likes + 1);
      setLiked(!liked);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all",
        liked
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
          : "border-border hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:hover:border-red-900 dark:hover:bg-red-950"
      )}
    >
      <Heart
        size={16}
        className={cn("transition-all", liked && "fill-current scale-110")}
      />
      <span>{likes}</span>
    </button>
  );
}

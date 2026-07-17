"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PostCard } from "@/components/blog/post-card";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  published: boolean;
  createdAt: Date;
  tags: { tag: { name: string; slug: string } }[];
  author: { name: string };
}

export function TagFilter({ tags, posts }: { tags: TagItem[]; posts: PostItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = selected
    ? posts.filter((p) => p.tags.some(({ tag }) => tag.slug === selected))
    : posts;

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 p-2 glass rounded-2xl">
            <button
              onClick={() => setSelected(null)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                !selected
                  ? "bg-primary/20 text-primary border-primary/40 shadow-sm"
                  : "text-muted-foreground hover:text-foreground glass-card"
              )}
            >
              全部
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelected(selected === tag.slug ? null : tag.slug)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                  selected === tag.slug
                    ? "bg-primary/20 text-primary border-primary/40 shadow-sm"
                    : "text-muted-foreground hover:text-foreground glass-card"
                )}
              >
                #{tag.name}
                <span className="ml-1 opacity-60">({tag._count.posts})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
          <h2 className="text-2xl font-bold">
            {selected ? `#${tags.find((t) => t.slug === selected)?.name}` : "最新文章"}
          </h2>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="relative text-center py-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl" />
          </div>
          <div className="text-7xl mb-4 opacity-30">✧</div>
          <p className="text-xl text-muted-foreground mb-2">还没有文章</p>
          <p className="text-sm text-muted-foreground/60">请登录管理后台发布第一篇文章</p>
        </div>
      )}
    </div>
  );
}

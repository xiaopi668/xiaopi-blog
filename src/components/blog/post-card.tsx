"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    published: boolean;
    createdAt: Date;
    tags: { tag: { name: string; slug: string } }[];
    author: { name: string };
  };
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)]">
      <article className="group relative rounded-2xl glass border hover:border-primary/30">
        <Link href={`/posts/${post.slug}`} className="block overflow-hidden rounded-2xl">
          {post.coverImage ? (
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ) : (
            <div className="h-24 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 transition-all duration-500 group-hover:from-indigo-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20" />
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <time>{formatDate(post.createdAt)}</time>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>{post.author.name}</span>
            </div>
            <h2 className="text-lg font-semibold mb-2 leading-snug">
              <span className="bg-gradient-to-r from-foreground to-foreground bg-[length:0%_2px] bg-[left_bottom] bg-no-repeat transition-all duration-500 group-hover:bg-[length:100%_2px] group-hover:text-primary">
                {post.title}
              </span>
            </h2>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed transition-colors duration-300 group-hover:text-foreground/80">
                {post.excerpt}
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(({ tag }) => (
                  <Badge key={tag.slug} variant="secondary" className="text-xs transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              阅读更多
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}

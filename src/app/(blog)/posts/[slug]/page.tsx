import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MarkdownRender } from "@/components/markdown-render";
import { LikeButton } from "@/components/blog/like-button";
import { CommentSection } from "@/components/blog/comment-section";
import { PostActions } from "@/components/blog/post-actions";

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      tags: { include: { tag: true } },
      author: { select: { id: true, name: true } },
      likes: { select: { userId: true } },
    },
  });

  if (post) {
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return post;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article className="max-w-3xl mx-auto animate-fade-in-up glass rounded-2xl p-6 md:p-8">
      <Link
        href="/posts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        返回文章列表
      </Link>

      <header className="mb-10">
        {post.coverImage && (
          <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-8">
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight tracking-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
              {post.author.name[0]}
            </div>
            <span>{post.author.name}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <time>{formatDate(post.createdAt)}</time>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          <span>{post.viewCount} 次阅读</span>
          {post.tags.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex gap-1.5">
                {post.tags.map(({ tag }) => (
                  <Badge key={tag.slug} variant="secondary" className="text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="relative">
        <MarkdownRender content={post.content} />
      </div>

      <div className="mt-10 flex items-center justify-center gap-6 py-6 border-y">
        <LikeButton postId={post.id} initialLikes={post.likes.length} />
      </div>

      <div className="mt-6 flex justify-end">
        <PostActions postId={post.id} postAuthorId={post.author.id} />
      </div>

      <div className="mt-10">
        <CommentSection postId={post.id} />
      </div>

      <div className="mt-10 pt-8 border-t flex justify-between items-center">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          全部文章
        </Link>
      </div>
    </article>
  );
}

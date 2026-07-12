import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import { PublishButton } from "@/components/admin/publish-button";
import { DeleteButton } from "@/components/admin/delete-button";

async function getPosts() {
  return prisma.post.findMany({
    include: {
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPostsPage() {
  const posts = await getPosts();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/admin/posts/new">
          <Button>
            <Plus size={16} className="mr-1" />
            写文章
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">标题</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">标签</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">状态</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">阅读</th>
                <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">日期</th>
                <th className="text-right p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <Link href={`/admin/posts/${post.id}`} className="font-medium hover:text-primary transition-colors">
                      {truncate(post.title, 40)}
                    </Link>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {post.tags.length > 0
                        ? post.tags.map(({ tag }) => (
                            <Badge key={tag.slug} variant="secondary" className="text-xs">{tag.name}</Badge>
                          ))
                        : <span className="text-muted-foreground text-xs">-</span>}
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <Badge variant={post.published ? "default" : "outline"} className="text-xs">
                      {post.published ? "已发布" : "草稿"}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm hidden md:table-cell">{post.viewCount}</td>
                  <td className="p-4 text-muted-foreground text-sm hidden lg:table-cell">{formatDate(post.createdAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!post.published && (
                        <PublishButton postId={post.id} />
                      )}
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs">编辑</Button>
                      </Link>
                      <DeleteButton postId={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <div className="text-4xl mb-3 opacity-20">📝</div>
                    还没有文章
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { PostCard } from "@/components/blog/post-card";

async function getPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <div className="glass rounded-2xl p-6 mb-8">
        <h1 className="text-3xl font-bold">全部文章</h1>
        <p className="text-sm text-muted-foreground mt-1">点击文章卡片阅读全文</p>
      </div>
      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          还没有文章
        </div>
      )}
    </div>
  );
}

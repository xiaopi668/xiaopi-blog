import Link from "next/link";
import { prisma } from "@/lib/db";

async function getTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });
}

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">标签</h1>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/posts?tag=${tag.slug}`}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all glass-card hover:bg-primary/20 hover:text-primary"
          >
            #{tag.name}
            <span className="ml-1.5 text-muted-foreground">({tag._count.posts})</span>
          </Link>
        ))}
        {tags.length === 0 && (
          <p className="text-muted-foreground">暂无标签</p>
        )}
      </div>
    </div>
  );
}

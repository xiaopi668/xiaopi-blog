import Link from "next/link";
import { prisma } from "@/lib/db";

export async function TagCloudWidget() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 20,
  });

  if (tags.length === 0) return <p className="text-xs text-muted-foreground">暂无标签</p>;

  const maxCount = Math.max(...tags.map(t => t._count.posts), 1);

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => {
        const weight = 0.6 + (t._count.posts / maxCount) * 0.4;
        return (
          <Link
            key={t.id}
            href={`/posts?tag=${t.slug}`}
            className="px-2 py-0.5 rounded-full bg-muted/40 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            style={{ fontSize: `${0.7 + weight * 0.2}rem` }}
          >
            #{t.name}
          </Link>
        );
      })}
    </div>
  );
}

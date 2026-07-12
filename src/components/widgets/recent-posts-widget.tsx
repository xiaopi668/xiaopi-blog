import Link from "next/link";
import { prisma } from "@/lib/db";

export async function RecentPostsWidget({ limit = 5 }: { limit?: number }) {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { slug: true, title: true, createdAt: true },
  });

  if (posts.length === 0) return <p className="text-xs text-muted-foreground">暂无文章</p>;

  return (
    <ul className="space-y-2">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/posts/${p.slug}`}
            className="text-sm text-foreground/80 hover:text-primary transition-colors line-clamp-1"
          >
            {p.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

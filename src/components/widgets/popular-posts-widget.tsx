import Link from "next/link";
import { prisma } from "@/lib/db";

export async function PopularPostsWidget({ limit = 5 }: { limit?: number }) {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: { slug: true, title: true, viewCount: true },
  });

  if (posts.length === 0) return <p className="text-xs text-muted-foreground">暂无数据</p>;

  const maxViews = Math.max(...posts.map(p => p.viewCount), 1);

  return (
    <ul className="space-y-2">
      {posts.map((p, i) => (
        <li key={p.slug} className="flex items-start gap-2">
          <span className={`text-xs font-bold shrink-0 mt-0.5 w-4 text-center ${
            i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground/40"
          }`}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <Link
              href={`/posts/${p.slug}`}
              className="text-sm text-foreground/80 hover:text-primary transition-colors line-clamp-1"
            >
              {p.title}
            </Link>
            <div className="w-full h-1 rounded-full bg-muted/40 mt-1 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
                style={{ width: `${(p.viewCount / maxViews) * 100}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

import { prisma } from "@/lib/db";
import { TagFilter } from "@/components/blog/tag-filter";

async function getPosts() {
  return prisma.post.findMany({
    where: { published: true },
    include: {
      tags: { include: { tag: true } },
      author: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

async function getTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });
}

export default async function HomePage() {
  const [posts, tags] = await Promise.all([getPosts(), getTags()]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative mb-16 pt-8 pb-12">
        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            个人博客
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">
              xiaopi&apos;小窝
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-lg mx-auto leading-relaxed text-dynamic">
            记录技术探索、生活感悟与奇思妙想
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <a
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl glass text-foreground text-sm font-medium hover:shadow-lg cursor-pointer"
            >
              浏览文章
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              href="/tags"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl glass text-muted-foreground text-sm font-medium hover:text-foreground transition-all cursor-pointer"
            >
              浏览标签
            </a>
          </div>
        </div>
      </section>

      {/* Posts — extra ambient tint so glass has something to blur */}
      <section className="relative">
        <div
          className="pointer-events-none absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-3xl opacity-80"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 30%, hsl(239 84% 70% / 0.18) 0%, transparent 55%)," +
              "radial-gradient(ellipse 60% 45% at 85% 40%, hsl(271 91% 70% / 0.14) 0%, transparent 55%)," +
              "radial-gradient(ellipse 50% 40% at 50% 90%, hsl(330 100% 75% / 0.12) 0%, transparent 50%)",
          }}
        />
        <TagFilter tags={tags} posts={posts} />
      </section>
    </div>
  );
}

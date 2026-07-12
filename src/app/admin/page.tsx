import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Eye, Tags, Users } from "lucide-react";

async function getStats() {
  const [postCount, tagCount, userCount, totalViews, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, viewCount: true, createdAt: true },
    }),
  ]);
  return { postCount, tagCount, userCount, totalViews: totalViews._sum.viewCount ?? 0, recentPosts };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const cards = [
    { title: "文章总数", value: stats.postCount, icon: FileText, color: "from-blue-500 to-blue-600", bg: "bg-blue-500/10" },
    { title: "总阅读量", value: stats.totalViews, icon: Eye, color: "from-green-500 to-green-600", bg: "bg-green-500/10" },
    { title: "标签数量", value: stats.tagCount, icon: Tags, color: "from-purple-500 to-purple-600", bg: "bg-purple-500/10" },
    { title: "用户数量", value: stats.userCount, icon: Users, color: "from-orange-500 to-orange-600", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">仪表盘</h1>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-0 glass-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon size={18} className="text-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-0 glass-card">
        <CardHeader>
          <CardTitle className="text-lg">最近文章</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentPosts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPosts.map((post, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm font-medium truncate max-w-xs">{post.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {post.viewCount} 次阅读
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">暂无文章</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

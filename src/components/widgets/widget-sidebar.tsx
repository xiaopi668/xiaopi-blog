import { prisma } from "@/lib/db";
import type { WidgetConfig, WidgetPosition } from "./types";
import { CalendarWidget } from "./calendar-widget";
import { AnnouncementWidget } from "./announcement-widget";
import { RecentPostsWidget } from "./recent-posts-widget";
import { PopularPostsWidget } from "./popular-posts-widget";
import { TagCloudWidget } from "./tag-cloud-widget";

async function Widget({ widget }: { widget: WidgetConfig }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500 shrink-0" />
        {widget.title}
      </h3>
      {widget.type === "calendar" && <CalendarWidget />}
      {widget.type === "announcement" && <AnnouncementWidget content={widget.content} />}
      {widget.type === "recent-posts" && <RecentPostsWidget />}
      {widget.type === "popular-posts" && <PopularPostsWidget />}
      {widget.type === "tag-cloud" && <TagCloudWidget />}
      {widget.type === "custom-html" && widget.content && (
        <div className="text-sm text-foreground/80 [&_a]:text-primary [&_a:hover]:underline" dangerouslySetInnerHTML={{ __html: widget.content }} />
      )}
    </div>
  );
}

export async function WidgetSidebar({ position }: { position: WidgetPosition }) {
  const row = await prisma.siteSetting.findUnique({ where: { key: "widgets" } });
  if (!row?.value) return null;

  let configs: WidgetConfig[];
  try { configs = JSON.parse(row.value); }
  catch { return null; }

  const enabled = configs
    .filter(w => w.enabled && (w.position === position || !w.position))
    .sort((a, b) => a.order - b.order);
  if (enabled.length === 0) return null;

  return <div className="space-y-4">{enabled.map(w => <Widget key={w.id} widget={w} />)}</div>;
}

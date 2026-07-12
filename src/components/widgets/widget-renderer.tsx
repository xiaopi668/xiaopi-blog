import type { WidgetConfig } from "./types";
import { CalendarWidget } from "./calendar-widget";
import { AnnouncementWidget } from "./announcement-widget";
import { FriendLinksWidget } from "./friend-links-widget";

export function WidgetRenderer({ widget }: { widget: WidgetConfig }) {
  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
        {widget.title}
      </h3>
      {widget.type === "calendar" && <CalendarWidget />}
      {widget.type === "announcement" && <AnnouncementWidget content={widget.content} />}
      {widget.type === "friend-links" && <FriendLinksWidget content={widget.content} />}
    </div>
  );
}

export function AnnouncementWidget({ content }: { content: string }) {
  if (!content) return <p className="text-xs text-muted-foreground">暂无公告</p>;

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground/90">
      {content}
    </div>
  );
}

"use client";

import { ExternalLink } from "lucide-react";

interface FriendLink {
  name: string;
  url: string;
  description?: string;
}

export function FriendLinksWidget({ content }: { content: string }) {
  let links: FriendLink[] = [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) links = parsed;
  } catch {}

  if (links.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">暂无友链</p>
    );
  }

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm glass-card group"
        >
          <div className="min-w-0">
            <span className="font-medium group-hover:text-primary transition-colors">{link.name}</span>
            {link.description && (
              <p className="text-xs text-muted-foreground truncate">{link.description}</p>
            )}
          </div>
          <ExternalLink size={12} className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>
      ))}
    </div>
  );
}

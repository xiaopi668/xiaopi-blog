export type WidgetType = "calendar" | "announcement" | "recent-posts" | "popular-posts" | "tag-cloud" | "custom-html" | "friend-links";

export type WidgetPosition = "left" | "right";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  content: string;
  enabled: boolean;
  order: number;
  position: WidgetPosition;
}

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}>
      {src ? (
        <img src={src} alt={alt ?? ""} className="aspect-square h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium">
          {fallback ?? "U"}
        </div>
      )}
    </div>
  );
}

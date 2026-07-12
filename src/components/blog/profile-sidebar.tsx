"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileData {
  avatar: string;
  displayName: string;
  bio: string;
  github: string;
  twitter: string;
  website: string;
  email: string;
  postCount: number;
  tagCount: number;
}

function getSettings(): Promise<Record<string, string>> {
  return fetch("/api/settings").then((r) => r.json()).then((data: { key: string; value: string }[]) => {
    const obj: Record<string, string> = {};
    data.forEach((s) => { obj[s.key] = s.value });
    return obj;
  });
}

export function ProfileSidebar({ className }: { className?: string }) {
  const [profile, setProfile] = useState<ProfileData>({
    avatar: "",
    displayName: "xiaopi",
    bio: "分享技术、生活与思考",
    github: "",
    twitter: "",
    website: "",
    email: "",
    postCount: 0,
    tagCount: 0,
  });

  useEffect(() => {
    getSettings().then((s) => {
      setProfile((p) => ({
        ...p,
        avatar: s.avatar || p.avatar,
        displayName: s.displayName || p.displayName,
        bio: s.bio || p.bio,
        github: s.github || p.github,
        twitter: s.twitter || p.twitter,
        website: s.website || p.website,
        email: s.email || p.email,
      }));
    });

    fetch("/api/posts?limit=0").then((r) => r.json()).then((data: unknown[]) => {
      if (Array.isArray(data)) setProfile((p) => ({ ...p, postCount: data.length }));
    });

    fetch("/api/tags").then((r) => r.json()).then((data: unknown[]) => {
      if (Array.isArray(data)) setProfile((p) => ({ ...p, tagCount: data.length }));
    });
  }, []);

  return (
    <div className="space-y-6">
        {/* Avatar Card */}
        <div className="glass rounded-2xl p-6 text-center">
          <div className="relative mx-auto w-28 h-28 mb-4 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="absolute inset-1 rounded-full bg-background" />
            <div className="absolute inset-2 rounded-full overflow-hidden ring-2 ring-border">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold">
                  {profile.displayName[0]}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold mb-1">{profile.displayName}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>

          <div className="mt-4 pt-4 border-t space-y-1.5 text-left">
            {profile.github && (
              <p className="text-xs text-muted-foreground">
                GitHub:{" "}
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {profile.github.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
            {profile.twitter && (
              <p className="text-xs text-muted-foreground">
                Twitter:{" "}
                <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {profile.twitter.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
            {profile.website && (
              <p className="text-xs text-muted-foreground">
                网站:{" "}
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
            {profile.email && (
              <p className="text-xs text-muted-foreground">
                邮箱:{" "}
                <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                  {profile.email}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="glass rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl glass-card">
              <div className="text-2xl font-bold bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                {profile.postCount}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">文章</div>
            </div>
            <div className="p-3 rounded-xl glass-card">
              <div className="text-2xl font-bold bg-gradient-to-br from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {profile.tagCount}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">标签</div>
            </div>
          </div>
        </div>
      </div>
  );
}

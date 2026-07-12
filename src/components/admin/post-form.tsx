"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, Save, Image, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownPreview } from "@/components/admin/markdown-preview";

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImage: string | null;
    published: boolean;
    tags: { tag: { name: string } }[];
  };
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags.map((t) => t.tag.name) ?? []);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then((data) => setAllTags(data)).catch(() => {});
  }, []);

  const generateSlug = useCallback((val: string) => {
    if (!post) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  }, [post]);

  function toggleTag(name: string) {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  }

  async function uploadFile(file: File, target: "cover" | "content") {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/media", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      if (target === "cover") {
        setCoverImage(data.url);
      } else {
        const ta = contentRef.current;
        if (ta) {
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          const imgTag = `![${file.name}](${data.url})`;
          setContent(content.slice(0, start) + imgTag + content.slice(end));
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + imgTag.length;
            ta.focus();
          });
        }
      }
      toast.success("上传成功");
    } else {
      toast.error("上传失败");
    }
    setUploading(false);
  }

  async function handleSubmit(published: boolean) {
    setLoading(true);

    const url = post ? `/api/posts/${post.id}` : "/api/posts";
    const method = post ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, excerpt, content, coverImage, published, tags: selectedTags }),
    });

    if (res.ok) {
      toast.success(published ? "文章已发布" : "草稿已保存");
      router.push("/admin/posts");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "操作失败");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-6 max-w-4xl"
    >
      <div className="glass rounded-2xl p-6 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            generateSlug(e.target.value);
          }}
          placeholder="文章标题"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="article-slug"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">摘要</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="文章摘要..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>
          <span>内容 (Markdown)</span>
        </Label>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!preview ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${preview ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              预览
            </button>
          </div>
          {!preview && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => contentInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
                <span className="ml-1.5">插入图片</span>
              </Button>
              <input
                ref={contentInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file, "content");
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>
        {preview ? (
          <MarkdownPreview content={content} />
        ) : (
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`# 标题\n\n这是一篇使用 **Markdown** 格式的文章。\n\n- 列表项 1\n- 列表项 2\n\n\`\`\`ts\nconsole.log("hello")\n\`\`\``}
            rows={18}
            required
            className="font-mono text-sm"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">封面图片</Label>
        <div className="flex gap-2">
          <Input
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="图片路径或 URL"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => coverInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          </Button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file, "cover");
            e.target.value = "";
          }} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>标签</Label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  active
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                {active && <X size={12} />}
                {tag.name}
                <span className="opacity-50">({tag._count.posts})</span>
              </button>
            );
          })}
          {allTags.length === 0 && (
            <p className="text-sm text-muted-foreground">暂无标签，请先在标签管理中创建</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 text-sm">
          {selectedTags.length > 0 && (
            <span className="text-muted-foreground text-xs">已选: {selectedTags.join(", ")}</span>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        >
          {loading ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Send size={16} className="mr-1.5" />
          )}
          {post?.published ? "更新发布" : "发布"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Save size={16} className="mr-1.5" />
          )}
          {post ? "更新草稿" : "存草稿"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          取消
        </Button>
      </div>
      </div>
    </form>
  );
}

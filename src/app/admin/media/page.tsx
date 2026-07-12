"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Trash2, Copy, Loader2 } from "lucide-react";

interface Media {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadMedia() {
    const res = await fetch("/api/media");
    if (res.ok) setMedia(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadMedia() }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/media", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      toast.success("上传成功");
      loadMedia();
    } else {
      toast.error("上传失败");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除？")) return;
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("已删除");
      loadMedia();
    } else {
      toast.error("删除失败");
    }
  }

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("链接已复制");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">媒体库</h1>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Upload size={16} className="mr-1" />}
          上传
        </Button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
      ) : media.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {media.map((item) => (
            <div key={item.id} className="group relative rounded-xl border-0 overflow-hidden glass-card">
              <div className="aspect-square relative">
                <img src={item.url} alt={item.filename} className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleCopy(item.url)}>
                  <Copy size={16} />
                </Button>
                <Button size="icon" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          暂无媒体文件
        </div>
      )}
    </div>
  );
}

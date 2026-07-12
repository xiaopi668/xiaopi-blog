"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Plus, Trash2, GripVertical } from "lucide-react";
import type { WidgetConfig } from "@/components/widgets/types";

interface Settings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;

  avatar: string;
  displayName: string;
  bio: string;
  github: string;
  twitter: string;
  website: string;
  email: string;

  backgroundType: string;
  backgroundValue: string;
  glassTransparency: string;
  glassBlur: string;
  glassRefraction: string;
  textColor: string;
  widgets: string;
}

const DEFAULT_AVATAR = "";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "xiaopi'小窝",
    siteDescription: "分享技术、生活与思考",
    siteKeywords: "blog, technology",
    avatar: "",
    displayName: "xiaopi",
    bio: "分享技术、生活与思考",
    github: "",
    twitter: "",
    website: "",
    email: "",
    backgroundType: "none",
    backgroundValue: "",
    glassTransparency: "50",
    glassBlur: "50",
    glassRefraction: "50",
    textColor: "",
    widgets: "[]",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "profile" | "appearance" | "widgets">("basic");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        const obj: Record<string, string> = {};
        data.forEach((s: { key: string; value: string }) => { obj[s.key] = s.value });
        setSettings((prev) => ({ ...prev, ...obj }));
      }
      setLoading(false);
    }
    load();
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleUpload(key: "avatar" | "backgroundValue") {
    const input = key === "avatar" ? avatarInputRef : bgInputRef;
    const file = input.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/media", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      update(key, data.url);
      toast.success("上传成功");
    } else {
      toast.error("上传失败");
    }
    setUploading(false);
    if (input.current) input.current.value = "";
  }

  // Debounced API save + event dispatch for glass sliders
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyGlass = useCallback((partial: Partial<Settings>) => {
    const merged = { ...settings, ...partial };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      }).catch(() => {});
    }, 600);
    window.dispatchEvent(new CustomEvent("glass-settings-updated", { detail: merged }));
  }, [settings]);

  function glassSlider(key: "glassTransparency" | "glassBlur" | "glassRefraction", label: string, left: string, right: string) {
    return (
      <div className="space-y-2">
        <Label>{label} ({settings[key]}%)</Label>
        <input
          type="range"
          min="0"
          max="100"
          value={settings[key]}
          onChange={(e) => {
            const v = e.target.value;
            update(key, v);
            applyGlass({ ...Object.fromEntries(
              ["glassTransparency","glassBlur","glassRefraction"].map(k => [k, k === key ? v : settings[k as keyof Settings]])
            ) as Partial<Settings> });
          }}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      window.dispatchEvent(new CustomEvent("glass-settings-updated", { detail: settings }));
      toast.success("设置已保存");
    } else {
      toast.error("保存失败");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tabs = [
    { key: "basic" as const, label: "基本" },
    { key: "profile" as const, label: "个人资料" },
    { key: "appearance" as const, label: "外观" },
    { key: "widgets" as const, label: "小组件" },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">站点设置</h1>

      <div className="flex gap-1 mb-6 p-1 rounded-xl glass w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-background/80 shadow-sm text-foreground glass-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="max-w-2xl glass-card border-0">
        <CardHeader>
          <CardTitle>
            {activeTab === "basic" && "基本设置"}
            {activeTab === "profile" && "个人资料"}
            {activeTab === "appearance" && "外观设置"}
            {activeTab === "widgets" && "小组件设置"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === "basic" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="siteTitle">站点标题</Label>
                <Input id="siteTitle" value={settings.siteTitle} onChange={(e) => update("siteTitle", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">站点描述</Label>
                <Textarea id="siteDescription" value={settings.siteDescription} onChange={(e) => update("siteDescription", e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteKeywords">关键词</Label>
                <Input id="siteKeywords" value={settings.siteKeywords} onChange={(e) => update("siteKeywords", e.target.value)} />
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <>
              <div className="space-y-2">
                  <Label>头像预览</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-border bg-muted shrink-0">
                      {settings.avatar ? (
                        <img src={settings.avatar} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold">
                          {settings.displayName[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={settings.avatar}
                        onChange={(e) => update("avatar", e.target.value)}
                        placeholder="留空使用首字母头像"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon" onClick={() => avatarInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      </Button>
                      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={() => handleUpload("avatar")} />
                    </div>
                  </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">显示名称</Label>
                <Input id="displayName" value={settings.displayName} onChange={(e) => update("displayName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea id="bio" value={settings.bio} onChange={(e) => update("bio", e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input id="github" value={settings.github} onChange={(e) => update("github", e.target.value)} placeholder="https://github.com/username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input id="twitter" value={settings.twitter} onChange={(e) => update("twitter", e.target.value)} placeholder="https://twitter.com/username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">网站</Label>
                  <Input id="website" value={settings.website} onChange={(e) => update("website", e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input id="email" value={settings.email} onChange={(e) => update("email", e.target.value)} placeholder="hello@example.com" />
                </div>
              </div>
            </>
          )}

          {activeTab === "widgets" && <WidgetsEditor settings={settings} setSettings={setSettings} />}

          {activeTab === "appearance" && (
            <>
              <div className="space-y-2">
                <Label>背景样式</Label>
                <div className="flex gap-2">
                  {[
                    { value: "none", label: "无" },
                    { value: "color", label: "纯色" },
                    { value: "gradient", label: "渐变" },
                    { value: "image", label: "图片" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("backgroundType", opt.value)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                        settings.backgroundType === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {settings.backgroundType === "color" && (
                <div className="space-y-2">
                  <Label htmlFor="bgColor">背景颜色</Label>
                  <div className="flex gap-3">
                    <Input
                      id="bgColor"
                      value={settings.backgroundValue}
                      onChange={(e) => update("backgroundValue", e.target.value)}
                      placeholder="#0f172a"
                    />
                    <input
                      type="color"
                      value={settings.backgroundValue || "#0f172a"}
                      onChange={(e) => update("backgroundValue", e.target.value)}
                      className="w-10 h-10 rounded-lg border cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {settings.backgroundType === "gradient" && (
                <div className="space-y-2">
                  <Label htmlFor="bgGradient">渐变 CSS</Label>
                  <Input
                    id="bgGradient"
                    value={settings.backgroundValue}
                    onChange={(e) => update("backgroundValue", e.target.value)}
                    placeholder="linear-gradient(135deg, #0f172a, #1e1b4b)"
                  />
                  <div className="p-4 rounded-xl border" style={{ background: settings.backgroundValue || "linear-gradient(135deg, #0f172a, #1e1b4b)" }} />
                </div>
              )}

              {settings.backgroundType === "image" && (
                <div className="space-y-2">
                  <Label htmlFor="bgImage">背景图片</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bgImage"
                      value={settings.backgroundValue}
                      onChange={(e) => update("backgroundValue", e.target.value)}
                      placeholder="图片路径或 URL"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => bgInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    </Button>
                    <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={() => handleUpload("backgroundValue")} />
                  </div>
                  {settings.backgroundValue && (
                    <div className="p-4 rounded-xl border bg-cover bg-center h-32" style={{ backgroundImage: `url(${settings.backgroundValue})` }} />
                  )}
                </div>
              )}

              {glassSlider("glassTransparency", "透明度", "透明", "实心")}
              {glassSlider("glassBlur", "模糊度", "清晰", "模糊")}
              {glassSlider("glassRefraction", "折射度", "平整", "扭曲")}

              <div className="space-y-2">
                <Label>网页字体颜色（留空使用默认）</Label>
                <div className="flex gap-3">
                  <Input
                    value={settings.textColor}
                    onChange={(e) => update("textColor", e.target.value)}
                    placeholder="#e2e8f0"
                  />
                  <input
                    type="color"
                    value={settings.textColor || "#e2e8f0"}
                    onChange={(e) => update("textColor", e.target.value)}
                    className="w-10 h-10 rounded-lg border cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl border overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
                <div
                  className="relative p-4 rounded-xl border text-sm"
                  style={{
                    background: `hsl(0 0% 100% / ${Number(settings.glassTransparency) / 100})`,
                    backdropFilter: `blur(${Number(settings.glassBlur) * 0.3}px)`,
                  }}
                >
                  <p className="font-medium mb-1">毛玻璃效果预览</p>
                  <p className="text-muted-foreground text-xs">透过磨砂玻璃般的视觉效果，让内容更突出。</p>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
              保存设置
            </Button>
          </div>
        </CardContent>
      </Card>

      <PasswordSection />
    </div>
  );
}

function WidgetsEditor({ settings, setSettings }: { settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>> }) {
  const [items, setItems] = useState<WidgetConfig[]>(() => {
    try { return JSON.parse(settings.widgets)?.map((w: Partial<WidgetConfig>) => ({ position: "right" as const, ...w })); }
    catch { return []; }
  });
  const [editId, setEditId] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    try { setItems(JSON.parse(settings.widgets).map((w: Partial<WidgetConfig>) => ({ position: "right" as const, ...w }))); }
    catch { setItems([]); }
  }, [settings.widgets]);

  function sync(widgets: WidgetConfig[]) {
    setItems(widgets);
    setSettings(prev => ({ ...prev, widgets: JSON.stringify(widgets.map((w, i) => ({ ...w, order: i }))) }));
  }

  function byZone(position: "left" | "right") {
    return items.filter(w => w.position === position);
  }

  function add(position: "left" | "right") {
    const id = Date.now().toString(36);
    sync([...items, { id, type: "announcement", title: "新组件", content: "", enabled: true, order: items.length, position }]);
    setEditId(id);
  }

  function remove(id: string) {
    sync(items.filter(w => w.id !== id));
    if (editId === id) setEditId(null);
  }

  function patch(id: string, part: Partial<WidgetConfig>) {
    sync(items.map(w => w.id === id ? { ...w, ...part } : w));
  }

  // Global drag state across both zones
  function onDragStart(e: React.DragEvent, id: string) {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).style.opacity = "0.4";
  }

  function onDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    dragId.current = null;
  }

  // Drop on a zone: move widget to this zone (only if coming from other zone)
  function onZoneDrop(e: React.DragEvent, toPosition: "left" | "right") {
    e.preventDefault();
    const id = dragId.current;
    if (!id) return;
    const w = items.find(x => x.id === id);
    if (!w) return;
    if (w.position !== toPosition) {
      sync(items.map(x => x.id === id ? { ...x, position: toPosition } : x));
    }
    dragId.current = null;
  }

  // Reorder within the same zone when dragging over another item
  function onItemDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const fromId = dragId.current;
    if (!fromId || fromId === targetId) return;
    const fromItem = items.find(x => x.id === fromId);
    const toItem = items.find(x => x.id === targetId);
    if (!fromItem || !toItem || fromItem.position !== toItem.position) return;
    // Swap orders to reorder within zone
    sync(items.map(x => {
      if (x.id === fromId) return { ...x, order: toItem.order };
      if (x.id === targetId) return { ...x, order: fromItem.order };
      return x;
    }));
    // Update dragId so subsequent drag-overs don't re-trigger with stale order
    dragId.current = targetId;
  }

  const typeLabels: Record<string, string> = {
    announcement: "公告", calendar: "日历", "recent-posts": "最新文章",
    "popular-posts": "阅读排行", "tag-cloud": "标签云", "custom-html": "自定义HTML",
    "friend-links": "友链",
  };

  const zoneColors = { left: "from-indigo-500/5 to-purple-500/5", right: "from-emerald-500/5 to-teal-500/5" };

  function renderZone(position: "left" | "right", label: string) {
    const zoneItems = byZone(position);
    return (
      <div
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
        onDrop={e => onZoneDrop(e, position)}
        className={`flex-1 rounded-xl border bg-gradient-to-b ${zoneColors[position]} min-h-[150px] p-2 space-y-2 transition-colors`}
      >
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${position === "left" ? "bg-indigo-400" : "bg-emerald-400"}`} />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
          <button
            onClick={() => add(position)}
            className="text-[10px] px-2 py-0.5 rounded bg-muted/30 hover:bg-muted/60 text-muted-foreground"
          >
            +添加
          </button>
        </div>

        <div className="space-y-1.5">
          {zoneItems.length === 0 && (
            <div className="text-[10px] text-muted-foreground/30 text-center py-4 border border-dashed rounded-lg">
              拖入小组件
            </div>
          )}
          {zoneItems.map(w => (
            <div key={w.id}>
              <div
                draggable
                onDragStart={e => onDragStart(e, w.id)}
                onDragOver={e => onItemDragOver(e, w.id)}
                onDragEnd={onDragEnd}
                onClick={() => setEditId(editId === w.id ? null : w.id)}
                className={`rounded-xl p-2.5 cursor-pointer transition-all text-xs select-none border ${
                  !w.enabled ? "opacity-35" : ""
                } ${editId === w.id ? "ring-2 ring-primary border-primary/30" : "hover:border-muted-foreground/20 border-transparent bg-background/60"}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical size={10} className="text-muted-foreground/25 shrink-0 cursor-grab" />
                    <span className="text-[11px] font-medium truncate">{w.title}</span>
                    <span className="text-[9px] text-muted-foreground/40 shrink-0">{typeLabels[w.type]}</span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); patch(w.id, { enabled: !w.enabled }); }}
                      className={`text-[9px] px-1 py-0.5 rounded ${w.enabled ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {w.enabled ? "显示" : "隐藏"}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); remove(w.id); }}
                      className="text-[9px] px-1 py-0.5 rounded text-red-400 hover:bg-red-50"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>

              {editId === w.id && (
                <div className="ml-3 mt-1.5 space-y-1.5 py-1.5 px-2 rounded-lg bg-muted/20">
                  <div className="flex gap-1.5">
                    <Input value={w.title} onChange={e => patch(w.id, { title: e.target.value })} placeholder="标题" className="text-[11px] h-6" />
                    <select
                      value={w.type}
                      onChange={e => patch(w.id, { type: e.target.value as WidgetConfig["type"] })}
                      className="text-[11px] rounded-lg border bg-transparent px-1.5 h-6"
                    >
                      {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  {(w.type === "announcement" || w.type === "custom-html") && (
                    <Textarea value={w.content} onChange={e => patch(w.id, { content: e.target.value })} placeholder={w.type === "custom-html" ? "HTML 代码" : "公告内容"} rows={2} className="text-[11px]" />
                  )}
                  {w.type === "recent-posts" && <p className="text-[9px] text-muted-foreground">自动显示最新发布的文章列表</p>}
                  {w.type === "popular-posts" && <p className="text-[9px] text-muted-foreground">按浏览量排行</p>}
                  {w.type === "tag-cloud" && <p className="text-[9px] text-muted-foreground">自动显示标签云</p>}
                  {w.type === "friend-links" && (
                    <FriendLinksEditor linksJson={w.content} onChange={(json) => patch(w.id, { content: json })} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">拖拽小组件到左侧栏或右侧栏，同区域可拖拽排序，点击展开编辑</p>

      {/* Full layout preview */}
      <div className="rounded-xl border bg-muted/10 p-3">
        <div className="text-[10px] text-muted-foreground/40 mb-3 px-1">博客主页布局预览</div>
        <div className="flex gap-3 items-stretch">
          {/* Left zone */}
          {renderZone("left", "左侧栏")}

          {/* Center (main content placeholder) */}
          <div className="w-24 shrink-0 rounded-xl border border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/5">
            <span className="text-[10px] text-muted-foreground/25 -rotate-90 whitespace-nowrap">文章列表</span>
          </div>

          {/* Right zone */}
          {renderZone("right", "右侧栏")}
        </div>
      </div>
    </div>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("请填写完整");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("新密码至少 6 位");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("两次密码不一致");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      toast.success("密码已修改");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      toast.error(data.error ?? "修改失败");
    }
    setSaving(false);
  }

  return (
    <Card className="max-w-2xl mt-6 glass-card border-0">
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">当前密码</Label>
          <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="输入当前密码" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">新密码</Label>
          <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少 6 位" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" />
        </div>
        <Button onClick={handleChangePassword} disabled={saving}>
          {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
          修改密码
        </Button>
      </CardContent>
    </Card>
  );
}

interface FriendLink {
  name: string;
  url: string;
  description?: string;
}

function FriendLinksEditor({ linksJson, onChange }: { linksJson: string; onChange: (json: string) => void }) {
  let links: FriendLink[] = [];
  try { const p = JSON.parse(linksJson); if (Array.isArray(p)) links = p; } catch {}

  function update(index: number, field: keyof FriendLink, value: string) {
    const next = links.map((link, i) => i === index ? { ...link, [field]: value } : link);
    onChange(JSON.stringify(next));
  }

  function remove(index: number) {
    onChange(JSON.stringify(links.filter((_, i) => i !== index)));
  }

  function add() {
    onChange(JSON.stringify([...links, { name: "", url: "", description: "" }]));
  }

  return (
    <div className="space-y-2">
      {links.map((link, i) => (
        <div key={i} className="flex gap-1 items-start">
          <div className="flex-1 space-y-1">
            <div className="flex gap-1">
              <Input value={link.name} onChange={e => update(i, "name", e.target.value)} placeholder="站点名称" className="text-[11px] h-6" />
              <Input value={link.url} onChange={e => update(i, "url", e.target.value)} placeholder="https://..." className="text-[11px] h-6" />
            </div>
            <Input value={link.description || ""} onChange={e => update(i, "description", e.target.value)} placeholder="简介（可选）" className="text-[11px] h-6" />
          </div>
          <button onClick={() => remove(i)} className="text-muted-foreground hover:text-destructive p-1">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full text-[11px] h-6">
        <Plus size={12} className="mr-1" />添加友链
      </Button>
    </div>
  );
}

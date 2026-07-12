export function BlogFooter() {
  return (
    <footer className="relative border-t mt-24">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              xiaopi&apos;小窝
            </h3>
            <p className="text-sm text-muted-foreground">分享技术、生活与思考</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">导航</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="/posts" className="hover:text-foreground transition-colors">文章</a>
              <a href="/tags" className="hover:text-foreground transition-colors">标签</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">关于</h4>
            <p className="text-sm text-muted-foreground">
              用 ❤️ 和 Next.js 构建
            </p>
          </div>
        </div>
        <div className="pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} xiaopi&apos;小窝. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

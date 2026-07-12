import { BlogHeader } from "@/components/blog/header";
import { BlogFooter } from "@/components/blog/footer";
import { PageTransition } from "@/components/page-transition";
import { ProfileSidebar } from "@/components/blog/profile-sidebar";
import { WidgetSidebar } from "@/components/widgets/widget-sidebar";
import { LiquidGlassFilter } from "@/components/blog/liquid-glass-filter";
import { AdaptiveTextContrast } from "@/components/blog/adaptive-text";
import { FloatingBlobs } from "@/components/blog/floating-blobs";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LiquidGlassFilter />
      <AdaptiveTextContrast />
      <FloatingBlobs />
      <BlogHeader />
      <div className="relative px-8 py-8 flex gap-8 w-full">
        {/* Left sidebar */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-24 space-y-6">
            <ProfileSidebar />
            <WidgetSidebar position="left" />
          </div>
        </aside>
        <main className="flex-1 min-h-[calc(100vh-8rem)]">
          <PageTransition>{children}</PageTransition>
        </main>
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-24">
            <WidgetSidebar position="right" />
          </div>
        </aside>
      </div>
      <BlogFooter />
    </>
  );
}

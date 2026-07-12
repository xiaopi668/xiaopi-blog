import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      <main className="flex-1 ml-60">
        <div className="p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { Sidebar } from "@/shared/components/Sidebar";
import { BottomNav } from "@/shared/components/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Sidebar />
      <div className="lg:pl-60 pb-16 lg:pb-0 min-h-screen">
        <main className="mx-auto max-w-2xl px-4 py-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}

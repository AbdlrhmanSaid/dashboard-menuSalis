import type { Metadata } from "next";
import SideBar from "@/components/Sidebar";
import Header from "@/components/dashboard/Header";
import AdminGuard from "@/lib/AdminGuard";

export const metadata: Metadata = {
  title: "منصة منيو ساليس | لوحة التحكم",
  description: "لوحة التحكم لإدارة الشركات والفروع والمنيوهات والمنتجات لساليس",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGuard>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800">
        {/* Sidebar - Sticky on the Right */}
        <SideBar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}

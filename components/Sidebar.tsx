"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
  Users,
  Building2,
  Store,
  SquareMenu,
  ShoppingBasket,
  History,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

const menuItems = [
  { label: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard", color: "text-slate-500" },
  { label: "المستخدمين", icon: Users, href: "/dashboard/users", color: "text-slate-500" },
  { label: "الشركات", icon: Building2, href: "/dashboard/companies", color: "text-slate-500" },
  { label: "الفروع", icon: Store, href: "/dashboard/branches", color: "text-slate-500" },
  { label: "القوائم", icon: SquareMenu, href: "/dashboard/menus", color: "text-slate-500" },
  { label: "المنتجات", icon: ShoppingBasket, href: "/dashboard/products", color: "text-slate-500" },
  { label: "السجل", icon: History, href: "/dashboard/history", color: "text-slate-500" },
  { label: "الإعدادات", icon: Settings, href: "/dashboard/settings", color: "text-slate-500" },
];

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.success("تم تسجيل الخروج بنجاح");
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed right-4 top-3.5 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none md:hidden transition-all duration-200"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-64 border-l border-slate-200 bg-white transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:static md:w-64 md:translate-x-0 flex flex-col`}
      >
        {/* Logo Container */}
        <div className="flex h-16 items-center justify-start px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-6 w-1 bg-red-600 rounded-full" />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              منيو ساليس
            </span>
          </Link>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setIsOpen(false);
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none
                  ${
                    isActive
                      ? "text-slate-950 bg-slate-100/80 border-r-2 border-red-600 rounded-r-none"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                  }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 transition-colors duration-150
                    ${
                      isActive
                        ? "text-red-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button Footer */}
        <div className="border-t border-slate-100 p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 py-5 text-sm font-semibold text-slate-700 transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4 text-slate-500" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>
    </>
  );
}

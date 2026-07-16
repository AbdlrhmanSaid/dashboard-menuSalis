"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Wifi } from "lucide-react";
import { toast } from "react-hot-toast";

const pathMap: Record<string, string> = {
  "/dashboard": "الرئيسية",
  "/dashboard/users": "إدارة المستخدمين",
  "/dashboard/companies": "إدارة الشركات",
  "/dashboard/branches": "إدارة الفروع",
  "/dashboard/menus": "إدارة المنيوهات",
  "/dashboard/products": "إدارة المنتجات",
  "/dashboard/history": "سجل الأحداث والعمليات",
  "/dashboard/settings": "الإعدادات",
};

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    return pathMap[pathname] || "لوحة التحكم";
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const getRoleLabel = (role?: string) => {
    if (role === "supervisor") return "مدير النظام";
    if (role === "admin") return "مشرف الفرع";
    return "مستخدم";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Right Side - Page Title & Breadcrumb */}
      <div className="flex flex-col">
        <h2 className="text-base font-bold text-slate-900">{getPageTitle()}</h2>
        <div className="hidden text-xs text-slate-400 sm:block mt-0.5">
          لوحة التحكم / {getPageTitle()}
        </div>
      </div>

      {/* Left Side - User Profile & Status */}
      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <div className="hidden items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 md:flex">
          <Wifi className="h-3.5 w-3.5 text-emerald-500" />
          <span>النظام متصل</span>
        </div>

        {/* User Info */}
        <div className="hidden flex-col items-end text-left sm:flex">
          <span className="text-sm font-semibold text-slate-800">
            {user?.username}
          </span>
          <span className="text-xs text-slate-400">
            {getRoleLabel(user?.role)}
          </span>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full border border-slate-200 p-0 hover:bg-slate-50"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-slate-100 text-slate-700 font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "M"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal text-right">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900">
                  {user?.username}
                </p>
                <p className="text-xs leading-none text-slate-400">
                  {getRoleLabel(user?.role)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-end gap-2 text-right cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <span>الملف الشخصي</span>
              <User className="h-4 w-4 text-slate-400" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex justify-end gap-2 text-right cursor-pointer"
              onClick={() => router.push("/dashboard/settings")}
            >
              <span>الإعدادات</span>
              <Settings className="h-4 w-4 text-slate-400" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex justify-end gap-2 text-red-600 focus:bg-red-50 focus:text-red-600 text-right font-medium cursor-pointer"
              onClick={handleLogout}
            >
              <span>تسجيل الخروج</span>
              <LogOut className="h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

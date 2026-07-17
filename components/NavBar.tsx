"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";

export default function NavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminOrSupervisor =
    user && ["supervisor", "admin"].includes(user.role);

  // Do not render NavBar inside the admin dashboard
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const isLoginPage = pathname === "/login";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-100/80 py-3.5 px-6 md:px-20 transition-all duration-300 w-full flex items-center justify-between shadow-sm">
      {/* Brand Logo / Home Link */}
      <div>
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-black text-slate-900 tracking-tight hover:opacity-90 transition-opacity"
        >
          <span>منيو سَلِس</span>
          <span className="h-2 w-2 rounded-full bg-red-600" />
        </Link>
      </div>

      {/* Action / User profile section */}
      <div className="flex items-center gap-4">
        {isAdminOrSupervisor && (
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 cursor-pointer h-9 px-4"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="h-4 w-4 text-red-600" />
            <span>لوحة التحكم</span>
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="" alt={user.username} />
                  <AvatarFallback className="rounded-lg bg-red-50 text-red-700 font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 rounded-2xl p-1.5 shadow-md border-slate-100"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuItem
                className="rounded-xl cursor-pointer text-xs font-semibold py-2.5 text-slate-700 focus:bg-slate-50"
                onClick={() => router.push("/profile")}
              >
                <User className="ml-2 h-4 w-4 text-slate-400" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl cursor-pointer text-xs font-semibold py-2.5 text-slate-700 focus:bg-slate-50"
                onClick={() => router.push("/settings")}
              >
                <Settings className="ml-2 h-4 w-4 text-slate-400" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl cursor-pointer text-xs font-bold py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 border-t border-slate-100 mt-1"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                <LogOut className="ml-2 h-4 w-4 text-red-500" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          !isLoginPage && (
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 cursor-pointer h-9 px-4"
              onClick={() => router.push("/login")}
            >
              <LogIn className="h-3.5 w-3.5 text-red-600" />
              <span>تسجيل الدخول</span>
            </Button>
          )
        )}
      </div>
    </nav>
  );
}

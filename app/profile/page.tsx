"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import AuthGuard from "@/lib/AuthGuard";
import Loading from "@/components/Loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import { ArrowRight, User, ShieldCheck, LogOut } from "lucide-react";

function ProfileContent() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError } = useCurrentUser();
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !user) {
    router.push("/login");
    return null;
  }

  const getRoleLabel = (role?: string) => {
    if (role === "supervisor") return "مدير النظام";
    if (role === "admin") return "مشرف الفروع";
    return "مستخدم عادي";
  };

  return (
    <AuthGuard requiresAuth={true}>
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="mx-auto max-w-md space-y-6">
          
          {/* Navigation Back */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للوحة التحكم</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 bg-red-600 rounded-full" />
              <span className="text-sm font-bold text-slate-800">منيو سَلِس</span>
            </div>
          </div>

          {/* Profile Card */}
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
                <User className="h-7 w-7" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">الملف الشخصي</CardTitle>
              <CardDescription className="text-sm text-slate-500">
                بيانات حسابك والبريد المسجل بالنظام حالياً.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">اسم المستخدم</span>
                  <div className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                    {data?.username || "غير متوفر"}
                  </div>
                </div>

                {/* Role */}
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">الصلاحية الحالية</span>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-100">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{getRoleLabel(data?.role)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100">
                <Button
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                  className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-5.5 flex items-center justify-center gap-2"
                  variant="destructive"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>تسجيل الخروج من الحساب</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}

export default dynamic(() => Promise.resolve(ProfileContent), { ssr: false });

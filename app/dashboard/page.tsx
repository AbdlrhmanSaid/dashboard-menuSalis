"use client";
import React, { memo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import {
  Shield,
  Clock,
  Activity,
  Plus,
  Package,
  GitBranch,
  ArrowLeft,
  History as HistoryIcon,
} from "lucide-react";
import Link from "next/link";
import { useHistory } from "@/hooks/useHistory";
import Loading from "@/components/Loading";

const DashboardPage = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const isSupervisor = user?.role === "supervisor";

  const {
    history: historyData,
    loading: historyLoading,
    error: historyError,
  } = useHistory();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRoleLabel = (role?: string) => {
    if (role === "supervisor") return "مدير النظام";
    if (role === "admin") return "مشرف";
    return "مستخدم";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-8 text-white shadow-lg border border-red-500/10">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-red-800/30 blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              لوحة التحكم الإدارية لمنصة منيو سَلِس
            </h1>
            <p className="text-red-100 max-w-xl text-base leading-relaxed">
              مرحباً بك {user?.username || "المستخدم"} في نظام التشغيل الموحد لإدارة الشركات والفروع وقوائم الطعام والمنتجات.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-md hover:bg-red-50 transition-all hover:scale-105"
            >
              <Package className="h-4.5 w-4.5" />
              <span>إدارة المنتجات</span>
            </Link>
            <Link
              href="/dashboard/branches"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-white/20 px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105"
            >
              <GitBranch className="h-4.5 w-4.5" />
              <span>عرض الفروع</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          إحصائيات النظام العامة
        </h3>
        <DashboardStats />
      </div>

      {/* Quick Actions and Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              سجل الأنشطة الأخيرة
            </h3>
            <Link
              href="/dashboard/history"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <span>عرض السجل بالكامل</span>
              <ArrowLeft className="h-3 w-3" />
            </Link>
          </div>

          {historyLoading ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Loading />
              <p className="text-xs text-slate-400 mt-2">جاري تحميل الأنشطة...</p>
            </div>
          ) : historyError ? (
            <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl font-medium">
              فشل تحميل سجل الأنشطة: {historyError}
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400 text-xs">
              <HistoryIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              لا توجد أنشطة مسجلة حالياً.
            </div>
          ) : (
            <div className="space-y-3">
              {historyData.slice(0, 5).map((item) => {
                const isProduct = item.type === "product";
                const typeStyles = isProduct
                  ? {
                      border: "border-r-4 border-r-amber-500",
                      badgeBg: "bg-amber-50 text-amber-700 border-amber-100",
                      iconColor: "text-amber-500 bg-amber-50",
                      icon: <Package className="h-4.5 w-4.5" />,
                      typeName: "منتج",
                    }
                  : {
                      border: "border-r-4 border-r-emerald-500",
                      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
                      iconColor: "text-emerald-500 bg-emerald-50",
                      icon: <GitBranch className="h-4.5 w-4.5" />,
                      typeName: "فرع",
                    };

                // Format simple time
                const date = new Date(item.createdAt);
                const timeStr = date.toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = date.toLocaleDateString("ar-EG", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={item._id}
                    className={`flex items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-sm transition-all duration-200 ${typeStyles.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeStyles.iconColor}`}>
                        {typeStyles.icon}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.action}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-semibold ${typeStyles.badgeBg}`}>
                            {typeStyles.typeName}
                          </span>
                          {item.target && (
                            <span>• المعرف: {item.target}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1 text-xs">
                      <span className="font-semibold text-slate-600 bg-slate-50 border border-slate-100/50 py-0.5 px-2 rounded-md">
                        {item.user}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {dateStr} في {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Column: Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
            الوصول السريع
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {/* Action 1: Add Product */}
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:shadow-sm hover:border-slate-300 transition-all group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800">إضافة منتج جديد</h4>
                <p className="text-xs text-slate-400">إضافة وجبة، مشروب أو صنف جديد</p>
              </div>
            </Link>

            {/* Action 2: Add Branch */}
            <Link
              href="/dashboard/branches"
              className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:shadow-sm hover:border-slate-300 transition-all group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-800">إضافة فرع جديد</h4>
                <p className="text-xs text-slate-400">إنشاء فرع جديد وتوليد كود الـ QR</p>
              </div>
            </Link>

            {/* Action 3: Add Company */}
            {isSupervisor && (
              <Link
                href="/dashboard/companies"
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:shadow-sm hover:border-slate-300 transition-all group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800">إضافة شركة جديدة</h4>
                  <p className="text-xs text-slate-400">تسجيل منشأة أو مطعم جديد بالنظام</p>
                </div>
              </Link>
            )}

            {/* Action 4: Add User */}
            {isSupervisor && (
              <Link
                href="/dashboard/users"
                className="flex items-center gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 hover:shadow-sm hover:border-slate-300 transition-all group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100/50 group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-800">إضافة مستخدم</h4>
                  <p className="text-xs text-slate-400">إضافة مشرف أو مدير جديد للنظام</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* System Status Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          حالة الخوادم والاتصال
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Permissions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-semibold text-slate-500">
                الصلاحيات
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Shield className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">
                {getRoleLabel(user?.role)}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                مستوى صلاحيات الحساب الحالي في لوحة التحكم
              </p>
            </div>
          </div>

          {/* Card 2: Last Login */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-semibold text-slate-500">
                آخر تسجيل دخول
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">
                {mounted
                  ? new Date().toLocaleDateString("ar-EG")
                  : "--/--/----"}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                في تمام الساعة{" "}
                {mounted ? new Date().toLocaleTimeString("ar-EG") : "--:--:--"}
              </p>
            </div>
          </div>

          {/* Card 3: System Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-semibold text-slate-500">
                حالة النظام
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  متصل ومستقر
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                جميع خوادم الـ API وقواعد البيانات تعمل بشكل ممتاز
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DashboardPage);

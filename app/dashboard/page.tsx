"use client";
import React, { memo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Shield, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getRoleLabel = (role?: string) => {
    if (role === "supervisor") return "مدير النظام";
    if (role === "admin") return "مشرف الفرع";
    return "مستخدم";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          أهلاً بك، {user?.username || "المستخدم"}
        </h1>
        <p className="text-sm text-slate-500 font-normal">
          تمنحك لوحة التحكم إشرافاً كاملاً على الشركات والفروع والمنتجات وسجلات العمليات.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">إحصائيات النظام العامة</h3>
        <DashboardStats />
      </div>

      {/* System Status and Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">حالة الخوادم والاتصال</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Permissions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-semibold text-slate-500">الصلاحيات</span>
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
              <span className="text-sm font-semibold text-slate-500">آخر تسجيل دخول</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-700">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">
                {mounted ? new Date().toLocaleDateString("ar-EG") : "--/--/----"}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                في تمام الساعة {mounted ? new Date().toLocaleTimeString("ar-EG") : "--:--:--"}
              </p>
            </div>
          </div>

          {/* Card 3: System Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4">
              <span className="text-sm font-semibold text-slate-500">حالة النظام</span>
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

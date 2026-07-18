"use client";
import React from "react";
import { useHistory } from "@/hooks/useHistory";
import HistoryList from "@/components/history/HistoryList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Trash2,
  RefreshCw,
  User,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const HistoryPage = () => {
  const { history, loading, error, refetch, clearHistory } = useHistory();
  const { user } = useAuth();

  const handleClearHistory = async () => {
    await clearHistory();
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            سجل الأحداث والعمليات
          </h1>
          <p className="text-slate-500 mt-1">
            مراقبة وعرض جميع التغييرات التي طرأت على المنتجات والفروع داخل لوحة
            التحكم
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === "supervisor" && (
            <>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 h-10 shadow-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>تحديث السجل</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold h-10 shadow-sm transition-all duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>مسح السجل</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader className="text-right">
                    <AlertDialogTitle className="text-lg font-bold text-slate-900">
                      تأكيد مسح سجل الأنشطة
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-slate-500">
                      هل أنت متأكد من مسح جميع الأحداث والعمليات المسجلة
                      نهائياً؟ لا يمكن التراجع عن هذا الإجراء بعد إتمامه.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-2 justify-start mt-4">
                    <AlertDialogCancel className="rounded-xl">
                      إلغاء
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearHistory}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
                    >
                      نعم، امسح السجل
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Modern Dashboard Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Total Events Stats */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500">
                إجمالي الأحداث
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {history.length}
              </h3>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-600">
              <History className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <span>سجل الأنشطة الحالي للمنصة</span>
          </div>
        </div>

        {/* Current User Stats */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500">
                المستخدم الحالي
              </p>
              <h3 className="text-xl font-bold text-slate-900 truncate max-w-[150px]">
                {user?.username || "غير محدد"}
              </h3>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <User className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <span className="capitalize">
              دور المستخدم: {user?.role || "مجهول"}
            </span>
          </div>
        </div>

        {/* Last Refreshed Stats */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500">آخر تحديث</p>
              <h3 className="text-sm font-bold text-slate-900 mt-2">
                {new Date().toLocaleDateString("ar-EG")}
              </h3>
              <p className="text-xs text-slate-500">
                {new Date().toLocaleTimeString("ar-EG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            <span>تحديث فوري للبيانات</span>
          </div>
        </div>

        {/* Auto Cleanup Info */}
        {/* <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-500">التنظيف التلقائي</p>
              <h3 className="text-sm font-bold text-slate-950 mt-2">يومياً الساعة 3:00 ص</h3>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400 leading-relaxed">
            <span>يتم مسح السجل تلقائياً لتخفيف العبء</span>
          </div>
        </div> */}
      </div>

      {/* History Feed List Section */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
            الأنشطة والأحداث الأخيرة
          </h2>
          <Badge
            variant="secondary"
            className="rounded-lg px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-50 border-0 text-xs font-semibold"
          >
            {history.length} عمليّة مسجّلة
          </Badge>
        </div>

        <HistoryList history={history} loading={loading} error={error} />
      </div>
    </div>
  );
};

export default HistoryPage;

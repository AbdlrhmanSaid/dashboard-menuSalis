import React, { useState, useMemo } from "react";
import HistoryItemComponent from "./HistoryItem";
import Loading from "@/components/Loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, History as HistoryIcon, Search, Package, GitBranch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  _id: string;
  action: string;
  user: string;
  target: string;
  type: "product" | "branch";
  createdAt: string;
  updatedAt: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  loading: boolean;
  error: string | null;
}

const HistoryList: React.FC<HistoryListProps> = ({
  history,
  loading,
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "product" | "branch">("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedActionType, setSelectedActionType] = useState<"all" | "create" | "update" | "delete">("all");

  // Filter and search history items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Type filter (product / branch)
      if (activeFilter !== "all" && item.type !== activeFilter) {
        return false;
      }
      
      // Date filter
      if (selectedDate) {
        const itemDate = new Date(item.createdAt).toISOString().split("T")[0];
        if (itemDate !== selectedDate) {
          return false;
        }
      }

      // Action Type filter
      if (selectedActionType !== "all") {
        const actionText = item.action.toLowerCase();
        if (selectedActionType === "create") {
          if (!actionText.includes("إضافة") && !actionText.includes("إنشاء")) return false;
        } else if (selectedActionType === "update") {
          if (
            !actionText.includes("تعديل") &&
            !actionText.includes("تحديث") &&
            !actionText.includes("تغيير") &&
            !actionText.includes("تفعيل") &&
            !actionText.includes("إيقاف")
          ) {
            return false;
          }
        } else if (selectedActionType === "delete") {
          if (!actionText.includes("حذف") && !actionText.includes("إزالة")) return false;
        }
      }

      // Search term filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.action.toLowerCase().includes(term) ||
        item.user.toLowerCase().includes(term) ||
        (item.target && item.target.toLowerCase().includes(term))
      );
    });
  }, [history, searchTerm, activeFilter, selectedDate, selectedActionType]);

  // Counts for badge filters
  const counts = useMemo(() => {
    return {
      all: history.length,
      product: history.filter((h) => h.type === "product").length,
      branch: history.filter((h) => h.type === "branch").length,
    };
  }, [history]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loading />
        <p className="text-sm text-slate-400 mt-4">جاري تحميل سجل الأحداث...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-xl border-red-100 bg-red-50 text-red-900">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="font-semibold">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search and Advanced Filters Bar */}
      <div className="space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="البحث بالعملية، المستخدم، أو المعرف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 rounded-xl border-slate-200 focus-visible:ring-red-500 bg-white text-sm"
            />
          </div>

          {/* Filters pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 shrink-0">
            <Button
              type="button"
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg text-xs font-semibold h-9 px-3.5 transition-all ${
                activeFilter === "all" 
                  ? "bg-slate-900 hover:bg-slate-800 text-white" 
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              <span>الكل ({counts.all})</span>
            </Button>

            <Button
              type="button"
              variant={activeFilter === "product" ? "default" : "outline"}
              onClick={() => setActiveFilter("product")}
              className={`rounded-lg text-xs font-semibold h-9 px-3.5 transition-all flex items-center gap-1.5 ${
                activeFilter === "product" 
                  ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600" 
                  : "border-slate-200 text-slate-600 bg-white hover:bg-amber-50/50 hover:text-amber-700"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>المنتجات ({counts.product})</span>
            </Button>

            <Button
              type="button"
              variant={activeFilter === "branch" ? "default" : "outline"}
              onClick={() => setActiveFilter("branch")}
              className={`rounded-lg text-xs font-semibold h-9 px-3.5 transition-all flex items-center gap-1.5 ${
                activeFilter === "branch" 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" 
                  : "border-slate-200 text-slate-600 bg-white hover:bg-emerald-50/50 hover:text-emerald-700"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>الفروع ({counts.branch})</span>
            </Button>
          </div>
        </div>

        {/* Tier 2: Advanced filters */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">نوع الإجراء:</span>
            <select
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value as "all" | "create" | "update" | "delete")}
              className="rounded-xl border border-slate-200 bg-white h-9 px-3 text-xs font-semibold focus-visible:ring-red-500 focus-visible:outline-none"
            >
              <option value="all">كل الإجراءات</option>
              <option value="create">إضافة / إنشاء</option>
              <option value="update">تعديل / تفعيل / إيقاف</option>
              <option value="delete">حذف / إزالة</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">تاريخ الإجراء:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white h-9 px-3 text-xs font-semibold focus-visible:ring-red-500 focus-visible:outline-none"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 h-9 rounded-xl border border-red-100 transition-colors"
                >
                  تصفير
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Items Feed */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-100 rounded-xl">
          <HistoryIcon className="mx-auto h-12 w-12 text-slate-300 animate-pulse" />
          <h3 className="mt-3 text-base font-bold text-slate-700">
            لا توجد أحداث مطابقة للبحث
          </h3>
          <p className="mt-1.5 text-sm text-slate-400 max-w-md mx-auto">
            جرب كتابة كلمات مفتاحية أخرى أو قم بتغيير فلاتر التصفية النشطة.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:right-[2.25rem] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100/50 before:hidden sm:before:block pr-0 sm:pr-2">
          {filteredHistory.map((item) => (
            <HistoryItemComponent key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Package, GitBranch } from "lucide-react";

interface HistoryItem {
  _id: string;
  action: string;
  user: string;
  target: string;
  type: "product" | "branch";
  createdAt: string;
  updatedAt: string;
}

interface HistoryItemProps {
  item: HistoryItem;
}

const HistoryItemComponent: React.FC<HistoryItemProps> = ({ item }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = formatDate(item.createdAt);

  const isProduct = item.type === "product";

  // Visual styles depending on type
  const typeStyles = isProduct
    ? {
        border: "border-r-4 border-r-amber-500",
        badgeBg: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
        iconColor: "text-amber-500 bg-amber-50",
        icon: <Package className="h-5 w-5" />,
        typeName: "منتج",
      }
    : {
        border: "border-r-4 border-r-emerald-500",
        badgeBg: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200",
        iconColor: "text-emerald-500 bg-emerald-50",
        icon: <GitBranch className="h-5 w-5" />,
        typeName: "فرع",
      };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-x-1 hover:shadow-md ${typeStyles.border}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Avatar, Type Icon, details */}
        <div className="flex items-start gap-4">
          {/* Action Icon wrapper */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110 ${typeStyles.iconColor}`}>
            {typeStyles.icon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${typeStyles.badgeBg}`}>
                {typeStyles.typeName}
              </Badge>
              {item.target && (
                <span className="text-xs font-medium text-slate-400">
                  المعرّف: {item.target}
                </span>
              )}
            </div>
            
            {/* The main action message */}
            <p className="text-sm font-semibold text-slate-800 leading-relaxed pt-1">
              {item.action}
            </p>
          </div>
        </div>

        {/* Right Side: Meta information (User, Time) */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-50 pt-3 sm:border-t-0 sm:pt-0 shrink-0">
          {/* User badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100/50">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">{item.user}</span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100/50">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">
              {date} في {time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryItemComponent;

import React from "react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo" | "teal";
}

const colorThemes = {
  blue: "text-blue-600 bg-blue-50 border-blue-100",
  green: "text-emerald-600 bg-emerald-50 border-emerald-100",
  purple: "text-purple-600 bg-purple-50 border-purple-100",
  orange: "text-orange-600 bg-orange-50 border-orange-100",
  red: "text-red-600 bg-red-50 border-red-100",
  indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
  teal: "text-teal-600 bg-teal-50 border-teal-100",
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = "blue",
}) => {
  const themeClass = colorThemes[color] || colorThemes.blue;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${themeClass}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
        <span>نشط حالياً في النظام</span>
        <span className="font-semibold text-emerald-600">نشط</span>
      </div>
    </div>
  );
};

export default StatsCard;

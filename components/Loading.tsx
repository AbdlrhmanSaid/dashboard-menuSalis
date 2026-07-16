import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  fullScreen?: boolean;
}

export default function Loading({ fullScreen = true }: LoadingProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-50/80 backdrop-blur-md"
    : "flex flex-col items-center justify-center gap-4 p-8 w-full min-h-[220px]";

  return (
    <div className={containerClass}>
      <div className="relative flex items-center justify-center">
        {/* Outer Spinning Ring */}
        <div className="h-14 w-14 rounded-full border-4 border-slate-100 border-t-red-600 animate-spin" />
        
        {/* Inner Pulsing Loader Icon */}
        <Loader2 className="absolute h-6 w-6 text-red-600 animate-pulse" />
      </div>
      
      {/* Loading message in Tajawal */}
      <span className="text-slate-500 text-sm font-semibold tracking-wide animate-pulse">
        جاري تحميل البيانات...
      </span>
    </div>
  );
}

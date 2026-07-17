"use client";

import { Branch } from "@/types/branch";
import {
  Card,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Store, MapPin, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { stripEmojis } from "@/lib/utils";

interface BranchCardProps {
  branch: Branch;
  slug: string;
}

export default function BranchCard({ branch, slug }: BranchCardProps) {
  const cleanedName = stripEmojis(branch.name);
  const cleanedAddress = stripEmojis(branch.address || "");

  return (
    <Link
      href={branch.isActive ? `/companies/${slug}/${branch._id}` : "#"}
      onClick={(e) => {
        if (!branch.isActive) {
          e.preventDefault();
          toast.error("هذا الفرع متوقف حالياً");
        }
      }}
      className="block h-full"
    >
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="h-full"
      >
        <Card
          className="h-full cursor-pointer border border-slate-100/70 bg-white/80 hover:bg-white backdrop-blur-sm hover:border-red-100/80 shadow-[0_12px_40px_rgba(0,0,0,0.015)] hover:shadow-[0_24px_50px_rgba(239,68,68,0.04)] transition-all duration-300 rounded-[28px] overflow-hidden flex flex-col justify-between p-6 gap-5"
          role="article"
          aria-label={`تفاصيل الفرع ${cleanedName}`}
        >
          <div className="flex items-start gap-4.5">
            {/* Store Icon container */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 shadow-sm shrink-0">
              <Store className="h-5 w-5" />
            </div>

            {/* Branch Details */}
            <div className="space-y-1.5 flex-1 min-w-0 text-right">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-bold text-slate-800">
                  {cleanedName}
                </CardTitle>

                {/* Status Badge */}
                {branch.isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100 shrink-0">
                    <CheckCircle className="h-3 w-3" />
                    <span>نشط</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-semibold text-red-700 border border-red-100 shrink-0">
                    <XCircle className="h-3 w-3" />
                    <span>متوقف</span>
                  </span>
                )}
              </div>

              <div className="flex items-start gap-1.5 text-xs text-slate-500 font-medium leading-relaxed">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{cleanedAddress || "لا يوجد عنوان مسجل لهذا الفرع"}</span>
              </div>
            </div>
          </div>
          
          {/* Card footer indicator */}
          <div className="border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 text-right shrink-0">
            {branch.isActive ? "اضغط لعرض المنيو ←" : "الفرع غير متاح مؤقتاً"}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

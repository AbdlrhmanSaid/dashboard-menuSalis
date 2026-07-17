"use client";

import { useMemo, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useBranchesByCompanySlug } from "@/hooks/useBranches";
import { Branch } from "@/types/branch";
import BranchCard from "@/components/BranchCard";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { Search, Store, AlertCircle } from "lucide-react";
import BackButton from "@/components/BackButton";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { stripEmojis } from "@/lib/utils";

export default function CompanyBranchesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: branches, isLoading, error } = useBranchesByCompanySlug(slug);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBranches = useMemo(() => {
    if (!branches || !Array.isArray(branches)) return [];
    return branches.filter((branch: Branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [branches, searchTerm]);

  // GSAP animation container reference
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!isLoading) {
      gsap.from(
        ".gsap-fade-up",
        { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="mx-auto max-w-md text-center rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">تعذر تحميل البيانات</h2>
          <p className="text-sm text-slate-500 font-medium">حدث خطأ أثناء جلب الفروع: {error.message}</p>
        </div>
      </div>
    );
  }

  const rawCompanyName = Array.isArray(branches) && branches.length > 0
    ? branches[0].company.name
    : slug;
  const companyName = stripEmojis(rawCompanyName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/60 to-red-50/10 relative overflow-hidden" dir="rtl">
      
      {/* Soft elegant blur circles */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-red-100/10 blur-[130px] -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/20 blur-[130px] -z-10" />

      <main ref={containerRef} className="max-w-5xl mx-auto px-4 py-12 md:py-16 w-full flex flex-col gap-10 items-center text-center">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between w-full gsap-fade-up max-w-5xl">
          <BackButton />
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 bg-red-600 rounded-full" />
            <span className="text-sm font-bold text-slate-800">منيو سَلِس</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="space-y-3 gsap-fade-up w-full max-w-xl">
          <div className="flex flex-col items-center gap-3.5 text-slate-900 justify-center">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 border border-red-100/60 flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.05)] shrink-0">
              <Store className="h-5.5 w-5.5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">فروع شركة {companyName}</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
            تصفح الفروع المختلفة لهذه الشركة واختر الفرع الأقرب إليك لمشاهدة المنيو.
          </p>
        </div>
        
        {/* Sleek Search Box */}
        <div className="relative w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl gsap-fade-up">
          <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <Input
            placeholder="ابحث عن فرع محدد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-11 h-12 rounded-2xl border-slate-200/80 focus:border-red-600 focus:ring-2 focus:ring-red-600/5 bg-white placeholder:text-slate-400 text-sm font-semibold"
          />
        </div>

        {/* Branches Grid */}
        {filteredBranches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm py-16 text-center gsap-fade-up w-full">
            <Store className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-400 font-semibold text-sm">لا توجد فروع مطابقة لبحثك حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
            {filteredBranches.map((branch: Branch) => (
              <div key={branch._id} className="gsap-fade-up">
                <BranchCard slug={slug} branch={branch} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

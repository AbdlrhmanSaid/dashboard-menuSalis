"use client";

import { memo, useState, useMemo, useEffect, useRef } from "react";
import AuthGuard from "@/lib/AuthGuard";
import { useCompanies } from "@/hooks/useCompanies";
import CompanyCard from "@/components/CompanyCard";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function CompaniesPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: companies, isLoading } = useCompanies();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  // GSAP animation container reference
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (mounted && !isLoading) {
      gsap.from(
        ".gsap-fade-up",
        { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [mounted, isLoading]);

  if (!mounted) {
    return <Loading />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loading />
      </div>
    );
  }

  return (
    <AuthGuard requiresAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/60 to-red-50/10 relative overflow-hidden" dir="rtl">
        
        {/* Soft elegant blur circles */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-red-100/10 blur-[130px] -z-10" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/20 blur-[130px] -z-10" />

        <main ref={containerRef} className="max-w-5xl mx-auto px-4 py-12 md:py-16 w-full flex flex-col gap-10 items-center text-center">
          
          {/* Header section with branding */}
          <div className="space-y-3 gsap-fade-up w-full max-w-xl">
            <div className="flex flex-col items-center gap-3.5 text-slate-900 justify-center">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 border border-red-100/60 flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.05)] shrink-0">
                <Building2 className="h-5.5 w-5.5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">الشركات المسجلة</h1>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
              اختر إحدى الشركات لعرض فروعها المتاحة وقوائم طعامها وتفاصيل منتجاتها بكل سهولة ويُسر.
            </p>
          </div>

          {/* Sleek Centered Search Bar */}
          <div className="relative w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl gsap-fade-up">
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="ابحث عن شركة باسمها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-11 h-12 rounded-2xl border-slate-200/80 focus:border-red-600 focus:ring-2 focus:ring-red-600/5 bg-white placeholder:text-slate-400 text-sm font-semibold"
            />
          </div>

          {/* Companies Grid */}
          {filteredCompanies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm py-16 text-center gsap-fade-up w-full">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-400 font-semibold text-sm">لا توجد شركات مطابقة لبحثك حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-center">
              {filteredCompanies.map((company) => (
                <div key={company._id} className="gsap-fade-up">
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

export default memo(CompaniesPage);

"use client";

import { useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useMenusByCompanySlug } from "@/hooks/useMenus";
import ProductItem from "@/components/ProductItem";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Search, Utensils, AlertCircle } from "lucide-react";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { stripEmojis } from "@/lib/utils";

export default function CompanyMenuPage() {
  const { slug, branchId } = useParams<{ slug: string; branchId: string }>();
  const {
    data: menus,
    isLoading,
    refetch,
    isFetching,
    error,
  } = useMenusByCompanySlug(slug);

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedMenuName, setSelectedMenuName] = useState("");

  const filteredMenus = useMemo(() => {
    if (!menus || !Array.isArray(menus)) return [];
    return menus.filter((menu) => {
      const matchMenu = selectedMenuName ? menu.name === selectedMenuName : true;
      return matchMenu;
    });
  }, [menus, selectedMenuName]);

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
          <p className="text-sm text-slate-500 font-medium">حدث خطأ أثناء جلب القوائم: {error.message}</p>
        </div>
      </div>
    );
  }

  const rawCompanyName = Array.isArray(menus) && menus.length > 0 && menus[0].company
    ? menus[0].company.name
    : slug;
  const companyName = stripEmojis(rawCompanyName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/60 to-red-50/10 relative overflow-hidden" dir="rtl">
      
      {/* Soft elegant blur circles */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-red-100/10 blur-[130px] -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/20 blur-[130px] -z-10" />

      <main ref={containerRef} className="max-w-5xl mx-auto px-4 py-12 md:py-16 w-full flex flex-col gap-10 items-center">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between w-full gsap-fade-up max-w-5xl">
          <BackButton />
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 bg-red-600 rounded-full" />
            <span className="text-sm font-bold text-slate-800">منيو ساليس</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-6 w-full gsap-fade-up border-b border-slate-100">
          <div className="space-y-2 text-right">
            <div className="flex items-center gap-3 text-slate-900 justify-start">
              <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 border border-red-100/60 flex items-center justify-center shadow-sm shrink-0">
                <Utensils className="h-5 w-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">قوائم طعام {companyName}</h1>
            </div>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              تصفح القوائم والوجبات اللذيذة المتاحة للطلب والاستعراض بالفرع.
            </p>
          </div>
          
          {/* Actions Column */}
          <div className="flex gap-2 w-full md:max-w-sm md:justify-end">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <Input
                placeholder="ابحث عن وجبة أو منتج..."
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                className="pr-10 h-11 rounded-xl border-slate-200/80 focus:border-red-600 focus:ring-2 focus:ring-red-600/5 bg-white text-xs font-semibold placeholder:text-slate-400"
              />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-11 w-11 rounded-xl border-slate-200/80 hover:bg-slate-50 bg-white cursor-pointer shrink-0"
              title="تحديث البيانات"
            >
              <RefreshCcw
                className={`h-4 w-4 text-slate-500 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        {/* Menu category filter tabs (Scrollable Pills) */}
        {Array.isArray(menus) && menus.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 w-full scrollbar-none gsap-fade-up md:justify-center">
            <button
              onClick={() => setSelectedMenuName("")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 shrink-0 cursor-pointer ${
                selectedMenuName === ""
                  ? "bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/10"
                  : "bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              عرض الكل
            </button>
            {menus.map((menu) => (
              <button
                key={menu._id}
                onClick={() => setSelectedMenuName(menu.name)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 shrink-0 cursor-pointer ${
                  selectedMenuName === menu.name
                    ? "bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/10"
                    : "bg-white border-slate-200/60 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {stripEmojis(menu.name)}
              </button>
            ))}
          </div>
        )}

        {/* Menus List */}
        <div className="space-y-10 w-full">
          {filteredMenus.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm py-16 text-center gsap-fade-up w-full">
              <Utensils className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-400 font-semibold text-sm">لا توجد قوائم طعام مطابقة حالياً.</p>
            </div>
          ) : (
            filteredMenus.map((menu) => {
              const matchedProducts = menu.products.filter((product) =>
                product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
              );

              if (matchedProducts.length === 0 && productSearchTerm) return null;

              return (
                <div key={menu._id} className="gsap-fade-up flex flex-col gap-5 w-full">
                  {/* Category Title */}
                  <div className="flex items-center gap-2.5 pb-2 justify-start border-b border-slate-100">
                    <span className="h-5 w-1 bg-red-600 rounded-full" />
                    <h2 className="text-base font-extrabold text-slate-800">{stripEmojis(menu.name)}</h2>
                    {menu.description && (
                      <span className="text-xs text-slate-400 font-semibold">({stripEmojis(menu.description)})</span>
                    )}
                  </div>

                  {/* Direct Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                    {matchedProducts.map((product) => (
                      <Link
                        className="block hover:no-underline"
                        href={`/product/${product._id}`}
                        key={product._id}
                      >
                        <ProductItem
                          product={product}
                          branchId={branchId}
                          price={product.price}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/useProducts";
import Loading from "@/components/Loading";
import Image from "next/image";
import { ShoppingBag, Tag, MapPin, Landmark, AlertCircle } from "lucide-react";
import BackButton from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { stripEmojis } from "@/lib/utils";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useProduct(id);

  // GSAP animation container reference
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!isLoading && product) {
      gsap.from(
        ".gsap-fade-up",
        { y: 20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, [isLoading, product]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loading />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="mx-auto max-w-md text-center rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
          <h2 className="text-lg font-bold text-slate-800 mb-1">تعذر تحميل المنتج</h2>
          <p className="text-sm text-slate-500 font-medium">
            {error ? `حدث خطأ أثناء جلب التفاصيل: ${error.message}` : "المنتج المطلوب غير موجود."}
          </p>
        </div>
      </div>
    );
  }

  const cleanedProductName = stripEmojis(product.name);
  const cleanedProductDescription = stripEmojis(product.description || "");
  const cleanedMenuName = stripEmojis(product.menu?.name || "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/60 to-red-50/10 relative overflow-hidden" dir="rtl">
      
      {/* Soft elegant blur circles */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-red-100/10 blur-[130px] -z-10" />
      <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/20 blur-[130px] -z-10" />

      <main ref={containerRef} className="max-w-5xl mx-auto px-4 py-12 md:py-16 space-y-8">
        
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between gsap-fade-up max-w-5xl">
          <BackButton />
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 bg-red-600 rounded-full" />
            <span className="text-sm font-bold text-slate-800">منيو ساليس</span>
          </div>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Large Image Block */}
          <div className="md:col-span-5 gsap-fade-up">
            <div className="relative aspect-square w-full bg-white/80 rounded-[28px] border border-slate-100/70 shadow-[0_12px_40px_rgba(0,0,0,0.015)] overflow-hidden flex items-center justify-center p-4">
              {product.image?.url ? (
                <Image
                  src={product.image.url}
                  alt={cleanedProductName}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                  priority
                />
              ) : (
                <ShoppingBag className="h-24 w-24 text-slate-200" />
              )}
            </div>
          </div>

          {/* Product metadata, price, and branches */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Main Info Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[28px] border border-slate-100/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.015)] space-y-5 gsap-fade-up">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="space-y-2 text-right">
                  {cleanedMenuName && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50/50 px-2.5 py-1 rounded-lg w-fit border border-red-100/50">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{cleanedMenuName}</span>
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 pt-1 leading-tight">{cleanedProductName}</h1>
                </div>
                
                {/* Product Price Tag */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3 text-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">السعر</span>
                  <span className="text-xl md:text-2xl font-black text-red-600">
                    {product.price ? `${product.price} ج.م` : "—"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100/60">
                <span className="text-[11px] font-bold text-slate-400 block">وصف وتفاصيل المنتج</span>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed bg-slate-50/30 border border-slate-100/50 rounded-2xl p-4.5 whitespace-pre-line text-right">
                  {cleanedProductDescription || "لا يوجد وصف تفصيلي مسجل لهذا المنتج حالياً."}
                </p>
              </div>

              {/* Additional Menu context */}
              {cleanedMenuName && (
                <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-400 justify-start">
                  <Landmark className="h-4.5 w-4.5" />
                  <span>ينتمي لقسم:</span>
                  <span className="text-slate-700 font-bold">{cleanedMenuName}</span>
                </div>
              )}
            </div>

            {/* Availability Branches Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[28px] border border-slate-100/70 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.015)] space-y-4 gsap-fade-up">
              <div className="flex items-center gap-3 border-b border-slate-100/60 pb-4 justify-start">
                <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 border border-red-100/60 flex items-center justify-center shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-slate-800">الفروع المتاحة للطلب</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">يتوفر هذا المنتج في الفروع التالية حالياً.</p>
                </div>
              </div>

              {product.availableBranches && product.availableBranches.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1 justify-start">
                  {product.availableBranches.map((branch: { _id: string; name: string }) => (
                    <Badge
                      key={branch._id}
                      variant="secondary"
                      className="rounded-xl bg-slate-50/50 hover:bg-slate-100 text-slate-600 px-3.5 py-1.5 border border-slate-100 font-bold text-xs"
                    >
                      {stripEmojis(branch.name)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs font-semibold text-slate-400">
                  عذراً، هذا المنتج غير متوفر في أي فروع حالياً.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

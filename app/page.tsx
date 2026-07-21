/* eslint-disable @next/next/no-img-element */
"use client";

import { memo, useState, useMemo, useEffect, useRef } from "react";
import AuthGuard from "@/lib/AuthGuard";
import { useCompanies } from "@/hooks/useCompanies";
import { useProducts } from "@/hooks/useProducts";
import CompanyCard from "@/components/CompanyCard";
import Loading from "@/components/Loading";
import { Input } from "@/components/ui/input";
import { Search, Building2, Package } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function CompaniesPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"companies" | "products">(
    "companies",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: companies, isLoading: isCompaniesLoading } = useCompanies();
  const { data: allProducts, isLoading: isProductsLoading } = useProducts();

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return companies.filter((company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [companies, searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    const query = productSearchTerm.trim().toLowerCase();
    if (!query) return allProducts;
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query)) ||
        (product.menu?.name &&
          product.menu.name.toLowerCase().includes(query)) ||
        (product.menu?.company?.name &&
          product.menu.company.name.toLowerCase().includes(query)),
    );
  }, [allProducts, productSearchTerm]);

  // GSAP animation container reference
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (mounted && !isCompaniesLoading && !isProductsLoading) {
      gsap.fromTo(
        ".gsap-fade-up",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, [mounted, isCompaniesLoading, isProductsLoading, activeTab]);

  if (!mounted) {
    return <Loading />;
  }

  const isLoading = isCompaniesLoading || isProductsLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loading />
      </div>
    );
  }

  return (
    <AuthGuard requiresAuth={true}>
      <div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50/60 to-red-50/10 relative overflow-hidden"
        dir="rtl"
      >
        {/* Soft elegant blur circles */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-red-100/10 blur-[130px] -z-10" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-slate-200/20 blur-[130px] -z-10" />

        <main
          ref={containerRef}
          className="max-w-5xl mx-auto px-4 py-12 md:py-16 w-full flex flex-col gap-8 items-center text-center"
        >
          {/* Header section with branding */}
          <div className="space-y-3 gsap-fade-up w-full max-w-xl">
            <div className="flex flex-col items-center gap-3.5 text-slate-900 justify-center">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 border border-red-100/60 flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.05)] shrink-0">
                <Building2 className="h-5.5 w-5.5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                نظام الاستعلام الموحد
              </h1>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-semibold leading-relaxed">
              تصفح دليل الشركات وفروعها، أو قم بالبحث الفوري عن المنتجات
              وأسعارها وتوافرها في الفروع لخدمة العملاء.
            </p>
          </div>

          {/* Elegant Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-md gsap-fade-up border border-slate-200/40">
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
                activeTab === "companies"
                  ? "bg-white text-red-600 shadow-sm border border-slate-200/10"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              دليل الشركات
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
                activeTab === "products"
                  ? "bg-white text-red-600 shadow-sm border border-slate-200/10"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              البحث عن منتج
            </button>
          </div>

          {activeTab === "companies" ? (
            <>
              {/* Sleek Centered Search Bar for Companies */}
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
                  <p className="text-slate-400 font-semibold text-sm">
                    لا توجد شركات مطابقة لبحثك حالياً.
                  </p>
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
            </>
          ) : (
            <>
              {/* Sleek Centered Search Bar for Products */}
              <div className="relative w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-2xl gsap-fade-up">
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <Input
                  placeholder="ابحث عن منتج باسمه، وصفه، أو شركته..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pr-11 h-12 rounded-2xl border-slate-200/80 focus:border-red-600 focus:ring-2 focus:ring-red-600/5 bg-white placeholder:text-slate-400 text-sm font-semibold"
                />
              </div>

              {/* Products Search Results Grid */}
              {filteredProducts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 backdrop-blur-sm py-16 text-center gsap-fade-up w-full">
                  <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-slate-400 font-semibold text-sm">
                    لا توجد منتجات مطابقة لبحثك حالياً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full justify-center text-right">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgba(220,38,38,0.03)] transition-all duration-300 flex flex-col justify-between gsap-fade-up"
                    >
                      <div className="space-y-4">
                        {/* Header info */}
                        <div className="flex gap-4 items-start">
                          {product.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product.name}
                              className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100/50 shrink-0 font-bold text-xs">
                              لا توجد صورة
                            </div>
                          )}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h3 className="font-extrabold text-slate-800 text-base leading-tight truncate">
                                {product.name}
                              </h3>
                              {product.price && (
                                <span className="inline-flex items-center rounded-lg bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
                                  {product.price} ج.م
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed">
                              {product.description ||
                                "لا يوجد وصف متوفر لهذا المنتج."}
                            </p>
                          </div>
                        </div>

                        {/* Metadata tags */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-50">
                          {product.menu?.company?.slug ? (
                            <Link
                              href={`/companies/${product.menu.company.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/75 px-2.5 py-1 rounded-lg transition-colors"
                            >
                              <Building2 className="h-3.5 w-3.5" />
                              <span>شركة: {product.menu.company.name}</span>
                            </Link>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>شركة غير معروفة</span>
                            </span>
                          )}
                          {product.menu?.name && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                              قائمة: {product.menu.name}
                            </span>
                          )}
                        </div>

                        {/* Available Branches list */}
                        <div className="space-y-2 pt-3 border-t border-slate-50">
                          <span className="text-xs font-extrabold text-slate-500 block">
                            توافر المنتج في الفروع:
                          </span>
                          {product.availableBranches &&
                          product.availableBranches.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {product.availableBranches.map((branch) => {
                                const companySlug = product.menu?.company?.slug;
                                return companySlug ? (
                                  <Link
                                    key={branch._id}
                                    href={`/companies/${companySlug}/${branch._id}`}
                                    className="text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-100 border border-slate-100 px-2.5 py-1 rounded-lg transition-all"
                                  >
                                    {branch.name}
                                  </Link>
                                ) : (
                                  <span
                                    key={branch._id}
                                    className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg"
                                  >
                                    {branch.name}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-red-500 font-semibold">
                              غير متوفر في أي فرع حالياً
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

export default memo(CompaniesPage);

"use client";

import { useMemo } from "react";
import { Product } from "@/types/menu";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { stripEmojis } from "@/lib/utils";

interface ProductItemProps {
  product: Product;
  branchId: string;
  price: number;
}

export default function ProductItem({
  product,
  branchId,
  price,
}: ProductItemProps) {
  // Safe availability check supporting both ObjectId strings and populated Branch objects
  const isAvailable = useMemo(() => {
    if (!product.availableBranches || !Array.isArray(product.availableBranches)) return false;
    return product.availableBranches.some((branch: any) => {
      if (typeof branch === "string") {
        return branch === branchId;
      }
      if (branch && typeof branch === "object" && "_id" in branch) {
        return branch._id === branchId;
      }
      return false;
    });
  }, [product.availableBranches, branchId]);

  const cleanedName = stripEmojis(product.name);
  const cleanedDescription = stripEmojis(product.description || "");

  return (
    <div className="flex items-center gap-4 p-4.5 rounded-[28px] bg-white/80 hover:bg-white backdrop-blur-sm border border-slate-100/70 hover:border-red-100/80 shadow-[0_12px_40px_rgba(0,0,0,0.015)] hover:shadow-[0_24px_50px_rgba(239,68,68,0.035)] transition-all duration-300">
      
      {/* Product Image Thumbnail */}
      <div className="relative h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 shadow-inner overflow-hidden shrink-0 flex items-center justify-center">
        {product.image?.url ? (
          <Image
            src={product.image.url}
            alt={cleanedName}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
        ) : (
          <ShoppingBag className="h-6 w-6 text-slate-300" />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-800 truncate">{cleanedName}</h4>
          
          <span className="text-sm font-bold text-red-600 shrink-0">
            {price ? `${price} ج.م` : "—"}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-medium truncate max-w-[280px]">
          {cleanedDescription || "لا يوجد وصف لهذا المنتج."}
        </p>

        <div className="pt-0.5">
          {isAvailable ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
              متاح للطلب
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 border border-red-100">
              غير متاح بالفرع
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

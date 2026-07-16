"use client";

import { useMemo } from "react";
import { Menu } from "@/types/menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductItem from "@/components/ProductItem";
import Link from "next/link";
import { SquareMenu } from "lucide-react";

interface MenuCardProps {
  menu: Menu;
  branchId: string;
  productSearchTerm?: string;
}

export default function MenuCard({
  menu,
  branchId,
  productSearchTerm = "",
}: MenuCardProps) {
  const filteredProducts = useMemo(() => {
    return menu.products.filter((product) =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  }, [menu.products, productSearchTerm]);

  return (
    <Card className="w-full border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header section with light gray header background */}
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 shrink-0">
            <SquareMenu className="h-4 w-4" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-800">{menu.name}</CardTitle>
        </div>
        <CardDescription className="text-sm text-slate-500 font-medium pl-10">
          {menu.description || "لا يوجد وصف لهذا المنيو."}
        </CardDescription>
      </CardHeader>
      
      {/* Content section listing products */}
      <CardContent className="p-6">
        {filteredProducts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-medium text-sm">
            لا توجد منتجات مطابقة للبحث في هذا القسم حالياً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
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
        )}
      </CardContent>
    </Card>
  );
}

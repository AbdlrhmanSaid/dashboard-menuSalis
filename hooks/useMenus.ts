import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  getMenusByCompanySlug,
} from "@/services/menuService";
import { getProducts } from "@/services/productService";
import toast from "react-hot-toast";
import { useMemo } from "react";

import type { Menu, CreateMenuRequest, UpdateMenuRequest } from "@/types/menu";
import type { Product as FullProduct } from "@/types/product";

export const useMenus = () => {
  return useQuery<Menu[], Error>({
    queryKey: ["menus"],
    queryFn: async () => {
      try {
        return await getMenus();
      } catch (error: any) {
        const message =
          error.response?.data?.message || "فشل جلب قائمة المنيوهات";
        toast.error(message);
        throw error;
      }
    },
    enabled: !!localStorage.getItem("token"),
    staleTime: 0,
  });
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, CreateMenuRequest>({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("تم إنشاء المنيو بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل إنشاء المنيو";
      toast.error(message);
    },
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<Menu, Error, { id: string; data: UpdateMenuRequest }>({
    mutationFn: ({ id, data }) => updateMenu(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("تم تحديث المنيو بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث المنيو";
      toast.error(message);
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menus"] });
      toast.success("تم حذف المنيو بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل حذف المنيو";
      toast.error(message);
    },
  });
};

export const useMenusByCompanySlug = (slug: string) => {
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;

  // 1. Fetch menus
  const menusQuery = useQuery<Menu[], Error>({
    queryKey: ["menusByCompany", slug],
    queryFn: async () => {
      try {
        return await getMenusByCompanySlug(slug);
      } catch (error: any) {
        const message =
          error.response?.data?.message || "فشل جلب المنيوهات للشركة";
        toast.error(message);
        throw error;
      }
    },
    enabled: !!token,
  });

  // 2. Fetch all products to get their details (images, descriptions)
  const productsQuery = useQuery<FullProduct[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: !!token,
  });

  // 3. Merge the product details into the menus
  const enrichedMenus = useMemo(() => {
    if (!menusQuery.data) return undefined;
    if (!productsQuery.data) return menusQuery.data;

    const productsMap = new Map(productsQuery.data.map((p) => [p._id, p]));

    return menusQuery.data.map((menu) => ({
      ...menu,
      products: menu.products.map((prod) => {
        const fullProd = productsMap.get(prod._id);
        return {
          ...prod,
          image: fullProd?.image || null,
          description: fullProd?.description || "",
        };
      }),
    }));
  }, [menusQuery.data, productsQuery.data]);

  return {
    ...menusQuery,
    data: enrichedMenus,
    isLoading: menusQuery.isLoading || productsQuery.isLoading,
    isFetching: menusQuery.isFetching || productsQuery.isFetching,
    error: menusQuery.error || productsQuery.error,
  };
};

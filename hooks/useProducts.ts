import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/productService";
import toast from "react-hot-toast";

import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";

export const useProducts = () => {
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;

  return useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: !!token,
    staleTime: 0,
  });
};
export const useProduct = (id: string) => {
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;

  return useQuery<Product, Error>({
    queryKey: ["product", id], // مميز لكل منتج
    queryFn: () => getProduct(id),
    enabled: !!token && !!id, // مينفعش يشتغل من غير id
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, CreateProductRequest>({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم إنشاء المنتج بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل إنشاء المنتج";
      toast.error(message);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Product,
    Error,
    { id: string; data: UpdateProductRequest }
  >({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم تحديث المنتج بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث المنتج";
      toast.error(message);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("تم حذف المنتج بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل حذف المنتج";
      toast.error(message);
    },
  });
};

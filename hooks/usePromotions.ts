import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from "@/types/promotion";
import * as promotionService from "@/services/promotionService";
import toast from "react-hot-toast";

export const usePromotions = () => {
  return useQuery<Promotion[], Error>({
    queryKey: ["promotions"],
    queryFn: promotionService.getPromotions,
  });
};

export const useActivePromotions = () => {
  return useQuery<Promotion[], Error>({
    queryKey: ["activePromotions"],
    queryFn: promotionService.getActivePromotions,
  });
};

export const usePromotion = (id: string) => {
  return useQuery<Promotion, Error>({
    queryKey: ["promotions", id],
    queryFn: () => promotionService.getPromotionById(id),
    enabled: !!id,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation<Promotion, Error, CreatePromotionRequest>({
    mutationFn: promotionService.createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["activePromotions"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل إنشاء العرض";
      const details = error.response?.data?.error ? `: ${error.response.data.error}` : "";
      toast.error(message + details);
    },
  });
};

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation<Promotion, Error, { id: string; data: UpdatePromotionRequest }>({
    mutationFn: ({ id, data }) => promotionService.updatePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["activePromotions"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث العرض";
      const details = error.response?.data?.error ? `: ${error.response.data.error}` : "";
      toast.error(message + details);
    },
  });
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: promotionService.deletePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["activePromotions"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل حذف العرض";
      const details = error.response?.data?.error ? `: ${error.response.data.error}` : "";
      toast.error(message + details);
    },
  });
};

export const useTogglePromotionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<Promotion, Error, { id: string; userName?: string }>({
    mutationFn: ({ id, userName }) => promotionService.togglePromotionStatus(id, userName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["activePromotions"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تغيير حالة العرض";
      toast.error(message);
    },
  });
};

import api from "@/lib/axios";
import { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from "@/types/promotion";

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await api.get<Promotion[]>("/promotions");
  return response.data;
};

export const getActivePromotions = async (): Promise<Promotion[]> => {
  const response = await api.get<Promotion[]>("/promotions/active");
  return response.data;
};

export const getPromotionById = async (id: string): Promise<Promotion> => {
  const response = await api.get<Promotion>(`/promotions/${id}`);
  return response.data;
};

export const createPromotion = async (
  promoData: CreatePromotionRequest
): Promise<Promotion> => {
  if (!promoData.bannerFile) {
    const payload: any = { ...promoData };
    delete payload.bannerFile;
    const response = await api.post<{ message: string; promotion: Promotion }>("/promotions", payload);
    return response.data.promotion;
  }

  const formData = new FormData();
  Object.keys(promoData).forEach((key) => {
    if (key !== "bannerFile" && key !== "banner" && (promoData as any)[key] !== undefined) {
      formData.append(key, (promoData as any)[key].toString());
    }
  });
  if (promoData.bannerFile) {
    formData.append("banner", promoData.bannerFile);
  }

  const response = await api.post<{ message: string; promotion: Promotion }>("/promotions", formData);
  return response.data.promotion;
};

export const updatePromotion = async (
  id: string,
  promoData: UpdatePromotionRequest
): Promise<Promotion> => {
  if (!promoData.bannerFile) {
    const payload: any = { ...promoData };
    delete payload.bannerFile;
    const response = await api.put<{ message: string; promotion: Promotion }>(`/promotions/${id}`, payload);
    return response.data.promotion;
  }

  const formData = new FormData();
  Object.keys(promoData).forEach((key) => {
    if (key !== "bannerFile" && key !== "banner" && key !== "_id" && (promoData as any)[key] !== undefined) {
      formData.append(key, (promoData as any)[key].toString());
    }
  });
  if (promoData.bannerFile) {
    formData.append("banner", promoData.bannerFile);
  }

  const response = await api.put<{ message: string; promotion: Promotion }>(`/promotions/${id}`, formData);
  return response.data.promotion;
};

export const deletePromotion = async (id: string): Promise<void> => {
  await api.delete(`/promotions/${id}`);
};

export const togglePromotionStatus = async (id: string, userName?: string): Promise<Promotion> => {
  const response = await api.put<{ message: string; promotion: Promotion }>(`/promotions/${id}/toggle`, { userName });
  return response.data.promotion;
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/services/companyService";
import toast from "react-hot-toast";

import { Company } from "@/types/company";

interface CreateCompanyRequest {
  name: string;
  slug: string;
  description: string;
  logoFile?: File | null;
  coverFile?: File | null;
  primaryColor?: string;
  secondaryColor?: string;
}

interface UpdateCompanyRequest {
  name?: string;
  slug?: string;
  description?: string;
  logoFile?: File | null;
  coverFile?: File | null;
  primaryColor?: string;
  secondaryColor?: string;
}

export const useCompanies = () => {
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;

  const queryResult = useQuery<Company[], Error>({
    queryKey: ["companies"],
    queryFn: getCompanies,
    enabled: !!token,
  });

  if (queryResult.isError) {
    const error: any = queryResult.error;
    const message = error?.response?.data?.message || "فشل جلب قائمة الشركات";
    toast.error(message);
  }

  return queryResult;
};
export const useCompany = (id: string) => {
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;

  const queryResult = useQuery<Company, Error>({
    queryKey: ["company", id],
    queryFn: () => getCompany(id),
    enabled: !!token && !!id,
  });

  if (queryResult.isError) {
    const error: any = queryResult.error;
    const message = error?.response?.data?.message || "فشل جلب بيانات الشركة";
    toast.error(message);
  }

  return queryResult;
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation<Company, Error, CreateCompanyRequest>({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("تم إنشاء الشركة بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل إنشاء الشركة";
      const details = error.response?.data?.error ? `: ${error.response.data.error}` : "";
      toast.error(message + details);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Company,
    Error,
    { id: string; data: UpdateCompanyRequest }
  >({
    mutationFn: ({ id, data }) => updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("تم تحديث الشركة بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث الشركة";
      const details = error.response?.data?.error ? `: ${error.response.data.error}` : "";
      toast.error(message + details);
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("تم حذف الشركة بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل حذف الشركة";
      const details = error.response?.data?.error ? `: ${error.response.data.error}` : "";
      toast.error(message + details);
    },
  });
};

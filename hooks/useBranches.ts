import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchesByCompanySlug,
} from "@/services/branchService";
import toast from "react-hot-toast";

interface Branch {
  _id: string;
  name: string;
  slug: string;
  company: {
    _id: string;
    name: string;
    slug: string;
  };
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateBranchRequest {
  name: string;
  slug: string;
  company: string; // Company ID
  address?: string;
  isActive?: boolean;
}

interface UpdateBranchRequest {
  name?: string;
  slug?: string;
  company?: string;
  address?: string;
  isActive?: boolean;
}

export const useBranches = () => {
  const isClient = typeof window !== "undefined";
  const token = isClient ? localStorage.getItem("token") : null;
  return useQuery<Branch[], Error>({
    queryKey: ["branches"],
    queryFn: async () => {
      try {
        return await getBranches();
      } catch (error: any) {
        const message = error.response?.data?.message || "فشل جلب قائمة الفروع";
        toast.error(message);
        throw error;
      }
    },
    enabled: !!token,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, CreateBranchRequest>({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("تم إنشاء الفرع بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل إنشاء الفرع";
      toast.error(message);
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<Branch, Error, { id: string; data: UpdateBranchRequest }>({
    mutationFn: ({ id, data }) => updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("تم تحديث الفرع بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث الفرع";
      toast.error(message);
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("تم حذف الفرع بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل حذف الفرع";
      toast.error(message);
    },
  });
};

export const useBranchesByCompanySlug = (slug: string) => {
  return useQuery<Branch[], Error>({
    queryKey: ["branchesByCompany", slug],
    queryFn: async () => {
      try {
        return await getBranchesByCompanySlug(slug);
      } catch (error: any) {
        const message =
          error.response?.data?.message || "فشل جلب الفروع للشركة";
        toast.error(message);
        throw error;
      }
    },
    enabled: !!localStorage.getItem("token") && !!slug,
  });
};

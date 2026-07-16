import api from "@/lib/axios";

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
  company?: string; // Company ID
  address?: string;
  isActive?: boolean;
}

export const getBranches = async (): Promise<Branch[]> => {
  const response = await api.get<Branch[]>("/branches");
  return response.data;
};

export const createBranch = async (
  branchData: CreateBranchRequest
): Promise<Branch> => {
  const response = await api.post<Branch>("/branches", branchData);
  return response.data;
};

export const updateBranch = async (
  id: string,
  branchData: UpdateBranchRequest
): Promise<Branch> => {
  const response = await api.put<Branch>(`/branches/${id}`, branchData);
  return response.data;
};

export const deleteBranch = async (id: string): Promise<void> => {
  await api.delete(`/branches/${id}`);
};

export const getBranchesByCompanySlug = async (
  slug: string
): Promise<Branch[]> => {
  const response = await api.get<Branch[]>(`/branches/by-company/${slug}`);
  return response.data;
};

export const toggleBranchStatus = async (
  branchId: string,
  userId: string,
  userName: string
): Promise<Branch> => {
  const response = await api.put<{ message: string; branch: Branch }>(
    `/branches/${branchId}/toggle`,
    { userId, userName }
  );
  return response.data.branch;
};

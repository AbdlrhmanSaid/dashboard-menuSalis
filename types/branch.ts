export interface Branch {
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

export interface CreateBranchRequest {
  name: string;
  slug: string;
  company: string; // Company ID
  address?: string;
  isActive?: boolean;
}

export interface UpdateBranchRequest {
  name?: string;
  slug?: string;
  company?: string; // Company ID
  address?: string;
  isActive?: boolean;
  userId?: string;
  userName?: string;
}

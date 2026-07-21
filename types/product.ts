export interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  image?: {
    public_id: string;
    url: string;
  } | null;
  menu: {
    _id: string;
    name: string;
    company: {
      _id: string;
      name: string;
      slug: string;
    };
  };
  availableBranches: {
    _id: string;
    name: string;
  }[];
  originalPrice?: number;
  finalPrice?: number;
  activePromotion?: any; // We will import Promotion type or use any for now to avoid circular dependency if needed, but better to use import. Let's just use any for quick typing
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price?: number;
  menu: string; // Menu ID
  companySlug?: string;
  availableBranches: string[];
  userId?: string;
  userName?: string;
  imageFile?: File | null;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  menu?: string; // Menu ID
  availableBranches?: string[];
  userId?: string;
  userName?: string;
  imageFile?: File | null;
}

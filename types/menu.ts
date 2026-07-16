export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: {
    public_id: string;
    url: string;
  } | null;
  availableBranches?: string[];
}

export interface Menu {
  _id: string;
  name: string;
  description: string;
  products: Product[];
  company: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateMenuRequest {
  name: string;
  description: string;
  company: string; // Company ID
}

export interface UpdateMenuRequest {
  name?: string;
  description?: string;
  company?: string; // Company ID
  products?: string[]; // Product IDs (if updating products)
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateCompanyRequest {
  name: string;
  slug: string;
  description: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  slug?: string;
  description?: string;
}

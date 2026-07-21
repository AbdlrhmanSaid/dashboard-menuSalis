export interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: { url: string; public_id: string } | string | null; // Some endpoints might return just the url string or object
  cover?: { url: string; public_id: string } | null;
  primaryColor?: string;
  secondaryColor?: string;
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

import api from "@/lib/axios";

interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateCompanyRequest {
  name: string;
  slug: string;
  description: string;
  logoFile?: File | null;
}

interface UpdateCompanyRequest {
  name?: string;
  slug?: string;
  description?: string;
  logoFile?: File | null;
}

function mapCompanyResponse(raw: any): Company {
  return {
    _id: raw._id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    logo: raw.logo?.url ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    __v: raw.__v,
  };
}

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get<Company[]>("/companies");
  // Backend returns array of companies (with logo object). Map to logo URL.
  const data: any[] = response.data as any;
  return data.map(mapCompanyResponse);
};

export const getCompany = async (id: string): Promise<Company> => {
  const response = await api.get(`/companies/${id}`);
  const data: any = response.data;
  return mapCompanyResponse(data.company ?? data);
};

export const createCompany = async (
  companyData: CreateCompanyRequest
): Promise<Company> => {
  // If no logo file is provided, send a clean JSON request (matching working Postman request)
  if (!companyData.logoFile) {
    const response = await api.post<{ message: string; company: any }>(
      "/companies",
      {
        name: companyData.name,
        slug: companyData.slug,
        description: companyData.description,
      }
    );
    return mapCompanyResponse(response.data.company ?? response.data);
  }

  const formData = new FormData();
  formData.append("name", companyData.name);
  formData.append("slug", companyData.slug);
  formData.append("description", companyData.description);
  formData.append("logo", companyData.logoFile);

  const response = await api.post<{ message: string; company: any }>(
    "/companies",
    formData
  );

  return mapCompanyResponse(response.data.company ?? response.data);
};

export const updateCompany = async (
  id: string,
  companyData: UpdateCompanyRequest
): Promise<Company> => {
  // If no logo file is provided, send a clean JSON request
  if (!companyData.logoFile) {
    const updateData: Record<string, any> = {};
    if (companyData.name !== undefined) updateData.name = companyData.name;
    if (companyData.slug !== undefined) updateData.slug = companyData.slug;
    if (companyData.description !== undefined) updateData.description = companyData.description;

    const response = await api.put<{ message: string; company: any }>(
      `/companies/${id}`,
      updateData
    );
    return mapCompanyResponse(response.data.company ?? response.data);
  }

  const formData = new FormData();
  if (companyData.name !== undefined) formData.append("name", companyData.name);
  if (companyData.slug !== undefined) formData.append("slug", companyData.slug);
  if (companyData.description !== undefined)
    formData.append("description", companyData.description);
  formData.append("logo", companyData.logoFile);

  const response = await api.put<{ message: string; company: any }>(
    `/companies/${id}`,
    formData
  );
  return mapCompanyResponse(response.data.company ?? response.data);
};

export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
};

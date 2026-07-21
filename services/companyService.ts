import api from "@/lib/axios";
import { Company, CreateCompanyRequest, UpdateCompanyRequest } from "@/types/company";

// Extended requests with files for internal service use
interface CreateCompanyServiceRequest extends CreateCompanyRequest {
  logoFile?: File | null;
  coverFile?: File | null;
  primaryColor?: string;
  secondaryColor?: string;
}

interface UpdateCompanyServiceRequest extends UpdateCompanyRequest {
  logoFile?: File | null;
  coverFile?: File | null;
  primaryColor?: string;
  secondaryColor?: string;
}

function mapCompanyResponse(raw: any): Company {
  return {
    _id: raw._id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    logo: raw.logo,
    cover: raw.cover,
    primaryColor: raw.primaryColor,
    secondaryColor: raw.secondaryColor,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    __v: raw.__v,
  };
}

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get<Company[]>("/companies");
  const data: any[] = response.data as any;
  return data.map(mapCompanyResponse);
};

export const getCompany = async (id: string): Promise<Company> => {
  const response = await api.get(`/companies/${id}`);
  const data: any = response.data;
  return mapCompanyResponse(data.company ?? data);
};

export const createCompany = async (
  companyData: CreateCompanyServiceRequest
): Promise<Company> => {
  if (!companyData.logoFile && !companyData.coverFile) {
    const payload: any = {
      name: companyData.name,
      slug: companyData.slug,
      description: companyData.description,
    };
    if (companyData.primaryColor) payload.primaryColor = companyData.primaryColor;
    if (companyData.secondaryColor) payload.secondaryColor = companyData.secondaryColor;

    const response = await api.post<{ message: string; company: any }>(
      "/companies",
      payload
    );
    return mapCompanyResponse(response.data.company ?? response.data);
  }

  const formData = new FormData();
  formData.append("name", companyData.name);
  formData.append("slug", companyData.slug);
  formData.append("description", companyData.description);
  if (companyData.primaryColor) formData.append("primaryColor", companyData.primaryColor);
  if (companyData.secondaryColor) formData.append("secondaryColor", companyData.secondaryColor);
  if (companyData.logoFile) formData.append("logo", companyData.logoFile);
  if (companyData.coverFile) formData.append("cover", companyData.coverFile);

  const response = await api.post<{ message: string; company: any }>(
    "/companies",
    formData
  );

  return mapCompanyResponse(response.data.company ?? response.data);
};

export const updateCompany = async (
  id: string,
  companyData: UpdateCompanyServiceRequest
): Promise<Company> => {
  if (!companyData.logoFile && !companyData.coverFile) {
    const updateData: Record<string, any> = {};
    if (companyData.name !== undefined) updateData.name = companyData.name;
    if (companyData.slug !== undefined) updateData.slug = companyData.slug;
    if (companyData.description !== undefined) updateData.description = companyData.description;
    if (companyData.primaryColor !== undefined) updateData.primaryColor = companyData.primaryColor;
    if (companyData.secondaryColor !== undefined) updateData.secondaryColor = companyData.secondaryColor;

    const response = await api.put<{ message: string; company: any }>(
      `/companies/${id}`,
      updateData
    );
    return mapCompanyResponse(response.data.company ?? response.data);
  }

  const formData = new FormData();
  if (companyData.name !== undefined) formData.append("name", companyData.name);
  if (companyData.slug !== undefined) formData.append("slug", companyData.slug);
  if (companyData.description !== undefined) formData.append("description", companyData.description);
  if (companyData.primaryColor !== undefined) formData.append("primaryColor", companyData.primaryColor);
  if (companyData.secondaryColor !== undefined) formData.append("secondaryColor", companyData.secondaryColor);
  if (companyData.logoFile) formData.append("logo", companyData.logoFile);
  if (companyData.coverFile) formData.append("cover", companyData.coverFile);

  const response = await api.put<{ message: string; company: any }>(
    `/companies/${id}`,
    formData
  );
  return mapCompanyResponse(response.data.company ?? response.data);
};

export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/companies/${id}`);
};

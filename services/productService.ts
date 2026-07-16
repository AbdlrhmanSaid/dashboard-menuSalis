import api from "@/lib/axios";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product";

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get<Product[]>("/products");
  return response.data;
};
export const getProduct = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  productData: CreateProductRequest
): Promise<Product> => {
  // If there's an image file, use FormData
  if (productData.imageFile) {
    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    if (productData.price !== undefined) {
      formData.append("price", String(productData.price));
    }
    if (productData.companySlug) {
      formData.append("companySlug", productData.companySlug);
    }
    if (productData.availableBranches?.length) {
      productData.availableBranches.forEach((branchId) => {
        formData.append("availableBranches", branchId);
      });
    }
    if (productData.userId) formData.append("userId", productData.userId);
    if (productData.userName) formData.append("userName", productData.userName);
    formData.append("image", productData.imageFile);

    const response = await api.post<{ message: string; product: Product }>(
      "/products",
      formData
    );
    return response.data.product;
  }

  // No image, send as JSON
  const { imageFile, ...jsonData } = productData;
  const response = await api.post<{ message: string; product: Product }>(
    "/products",
    jsonData
  );
  return response.data.product;
};

export const updateProduct = async (
  id: string,
  productData: UpdateProductRequest
): Promise<Product> => {
  // If there's an image file, use FormData
  if (productData.imageFile) {
    const formData = new FormData();
    if (productData.name) formData.append("name", productData.name);
    if (productData.description)
      formData.append("description", productData.description);
    if (productData.price !== undefined)
      formData.append("price", String(productData.price));
    if (productData.menu) formData.append("menu", productData.menu);
    if (productData.availableBranches?.length) {
      productData.availableBranches.forEach((branchId) => {
        formData.append("availableBranches", branchId);
      });
    }
    if (productData.userId) formData.append("userId", productData.userId);
    if (productData.userName) formData.append("userName", productData.userName);
    formData.append("image", productData.imageFile);

    const response = await api.put<{ message: string; product: Product }>(
      `/products/${id}`,
      formData
    );
    return response.data.product ?? response.data;
  }

  // No image, send as JSON
  const { imageFile, ...jsonData } = productData;
  const response = await api.put<{ message: string; product: Product }>(
    `/products/${id}`,
    jsonData
  );
  return response.data.product;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const toggleProductInBranch = async (
  productId: string,
  branchId: string,
  userId: string,
  userName: string
): Promise<Product> => {
  const response = await api.put<{ message: string; product: Product }>(
    `/products/${productId}/toggle-branch/${branchId}`,
    { userId, userName }
  );
  return response.data.product;
};

export const updateProductBranches = async (
  productId: string,
  availableBranches: string[],
  userId: string,
  userName: string
): Promise<Product> => {
  const response = await api.put<{ message: string; product: Product }>(
    `/products/${productId}/update-branches`,
    { availableBranches, userId, userName }
  );
  return response.data.product;
};

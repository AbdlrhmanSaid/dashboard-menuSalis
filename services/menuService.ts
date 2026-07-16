import api from "@/lib/axios";

import type { Menu, CreateMenuRequest, UpdateMenuRequest } from "@/types/menu";

export const getMenus = async (): Promise<Menu[]> => {
  const response = await api.get<Menu[]>("/menus");
  return response.data;
};

export const createMenu = async (
  menuData: CreateMenuRequest
): Promise<Menu> => {
  const response = await api.post<{ message: string; menu: Menu }>("/menus", menuData);
  return response.data.menu;
};

export const updateMenu = async (
  id: string,
  menuData: UpdateMenuRequest
): Promise<Menu> => {
  const response = await api.put<{ message: string; menu: Menu }>(`/menus/${id}`, menuData);
  return response.data.menu;
};

export const deleteMenu = async (id: string): Promise<void> => {
  await api.delete(`/menus/${id}`);
};

export const getMenusByCompanySlug = async (slug: string): Promise<Menu[]> => {
  const response = await api.get<Menu[]>(`/menus/by-company/${slug}`);
  return response.data;
};

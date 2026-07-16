import axios from "@/lib/axios";

export interface DashboardStats {
  companies: number;
  branches: number;
  menus: number;
  products: number;
  users: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await axios.get("/dashboard");
    return response.data;
  },
};

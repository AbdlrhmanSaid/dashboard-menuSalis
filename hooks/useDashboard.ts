import { useState, useEffect } from "react";
import { dashboardService, DashboardStats } from "@/services/dashboardService";

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    companies: 0,
    branches: 0,
    menus: 0,
    products: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء جلب إحصائيات الداشبورد"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

import React from "react";
import StatsCard from "./StatsCard";
import { useDashboard } from "@/hooks/useDashboard";
import {
  Building2,
  GitBranch,
  MenuSquare,
  Package,
  Users,
  Loader2,
} from "lucide-react";

const DashboardStats: React.FC = () => {
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        title="الشركات"
        value={stats.companies}
        icon={<Building2 className="h-4 w-4" />}
        color="blue"
      />
      <StatsCard
        title="الفروع"
        value={stats.branches}
        icon={<GitBranch className="h-4 w-4" />}
        color="green"
      />
      <StatsCard
        title="القوائم"
        value={stats.menus}
        icon={<MenuSquare className="h-4 w-4" />}
        color="purple"
      />
      <StatsCard
        title="المنتجات"
        value={stats.products}
        icon={<Package className="h-4 w-4" />}
        color="orange"
      />
      <StatsCard
        title="المستخدمين"
        value={stats.users}
        icon={<Users className="h-4 w-4" />}
        color="red"
      />
    </div>
  );
};

export default DashboardStats;

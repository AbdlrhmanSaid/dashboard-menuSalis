"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useHistory } from "@/hooks/useHistory";
import { Loader2, Package, GitBranch, Users, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

export default function DashboardCharts() {
  const { data: products, isLoading: productsLoading, error: productsError } = useProducts();
  const { history, loading: historyLoading, error: historyError } = useHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Calculate Active vs Stopped products (stopped = not active in any branch)
  const productStats = useMemo(() => {
    if (!products) return { active: 0, stopped: 0, total: 0, activePercentage: 0 };
    const total = products.length;
    const active = products.filter((p) => p.availableBranches && p.availableBranches.length > 0).length;
    const stopped = total - active;
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;
    return { active, stopped, total, activePercentage };
  }, [products]);

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: "نشط بالفرع", value: productStats.active, color: "#10b981" },
      { name: "متوقف (بدون فرع)", value: productStats.stopped, color: "#f43f5e" }
    ];
  }, [productStats]);

  // 2. Calculate top branches by product counts
  const topBranches = useMemo(() => {
    if (!products) return [];
    const branchCounts: Record<string, { id: string; name: string; count: number }> = {};
    products.forEach((product) => {
      if (product.availableBranches) {
        product.availableBranches.forEach((branch) => {
          if (!branchCounts[branch.name]) {
            branchCounts[branch.name] = { id: branch._id, name: branch.name, count: 0 };
          }
          branchCounts[branch.name].count += 1;
        });
      }
    });

    const sorted = Object.values(branchCounts).sort((a, b) => b.count - a.count);
    return sorted.slice(0, 5); // top 5
  }, [products]);

  const barData = useMemo(() => {
    return topBranches.map((b) => ({
      name: b.name,
      "عدد المنتجات": b.count
    }));
  }, [topBranches]);

  // 3. Calculate top active users by updates/actions from history logs
  const topUsers = useMemo(() => {
    if (!history) return [];
    const userCounts: Record<string, number> = {};
    history.forEach((log) => {
      if (log.user) {
        userCounts[log.user] = (userCounts[log.user] || 0) + 1;
      }
    });

    const sorted = Object.entries(userCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    return sorted.slice(0, 5); // top 5
  }, [history]);

  const areaData = useMemo(() => {
    return topUsers.map((u) => ({
      name: u.name,
      "الأنشطة": u.count
    }));
  }, [topUsers]);

  const isLoading = productsLoading || historyLoading;
  const error = productsError || historyError;

  if (isLoading || !mounted) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="mr-2 text-xs font-semibold text-slate-500">جاري تحميل رسوم الإحصائيات البيانية...</span>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 text-right" dir="rtl">
      {/* Chart 1: Active vs Stopped Products */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between h-[360px]">
        <div>
          <h4 className="text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
            <Package className="h-4.5 w-4.5 text-amber-500" />
            <span>حالة توفر المنتجات</span>
          </h4>
          
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} منتج`]}
                  contentStyle={{ direction: "rtl", borderRadius: "12px", border: "1px solid #f1f5f9" }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {productStats.stopped > 0 ? (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-semibold bg-rose-50/40 p-2.5 rounded-xl border border-rose-100/30 mt-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>يوجد {productStats.stopped} منتج غير مرتبط بأي فرع (خارج الخدمة).</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/30 mt-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>كافة المنتجات متوفرة وتعمل بنجاح في الفروع.</span>
          </div>
        )}
      </div>

      {/* Chart 2: Top Branches by Products */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between h-[360px]">
        <div>
          <h4 className="text-sm font-extrabold text-slate-700 mb-4 flex items-center gap-1.5">
            <GitBranch className="h-4.5 w-4.5 text-emerald-600" />
            <span>أكثر الفروع وفرة بالمنتجات</span>
          </h4>
          
          {barData.length === 0 ? (
            <p className="text-xs text-slate-400 py-16 text-center font-semibold">لا توجد فروع مسجلة أو مرتبطة بمنتجات.</p>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ direction: "rtl", borderRadius: "12px", border: "1px solid #f1f5f9" }}
                  />
                  <Bar dataKey="عدد المنتجات" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#10b981" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Chart 3: Top Active Users / Editors */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between h-[360px]">
        <div>
          <h4 className="text-sm font-extrabold text-slate-700 mb-4 flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-rose-600" />
            <span>أكثر الموظفين تعديلاً ونشاطاً</span>
          </h4>
          
          {areaData.length === 0 ? (
            <p className="text-xs text-slate-400 py-16 text-center font-semibold">لا توجد عمليات مسجلة في التاريخ بعد.</p>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ direction: "rtl", borderRadius: "12px", border: "1px solid #f1f5f9" }}
                  />
                  <Area type="monotone" dataKey="الأنشطة" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorActivities)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

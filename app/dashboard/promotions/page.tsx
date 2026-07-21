"use client";

import { useState, useMemo } from "react";
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
  useTogglePromotionStatus,
} from "@/hooks/usePromotions";
import { useCompanies } from "@/hooks/useCompanies";
import { useMenus } from "@/hooks/useMenus";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";
import { Edit2, Trash2, Plus, Search, Tag, Image as ImageIcon, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import { Promotion } from "@/types/promotion";
import Image from "next/image";
import PageHeader from "@/components/dashboard/PageHeader";

interface PromotionFormData {
  title: string;
  description: string;
  targetType: "Company" | "Menu" | "Product";
  target: string;
  discountType: "Percentage" | "Fixed Amount" | "Fixed Price";
  discountValue: number;
  priority: number;
  startDate: string;
  endDate: string;
  banner?: FileList;
}

export default function PromotionsDashboard() {
  const { data: promotions, isLoading } = usePromotions();
  const { mutate: createPromotion, isPending: isCreating } = useCreatePromotion();
  const { mutate: updatePromotion, isPending: isUpdating } = useUpdatePromotion();
  const { mutate: deletePromotion, isPending: isDeleting } = useDeletePromotion();
  const { mutate: toggleStatus, isPending: isToggling } = useTogglePromotionStatus();
  
  const { data: companies } = useCompanies();
  const { data: menus } = useMenus();
  const { data: products } = useProducts();

  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor" || user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPromotionId, setEditingPromotionId] = useState<string | null>(null);
  const [deletingPromotionId, setDeletingPromotionId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createCompanyFilter, setCreateCompanyFilter] = useState("");
  const [editCompanyFilter, setEditCompanyFilter] = useState("");

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    watch: watchCreate,
  } = useForm<PromotionFormData>({
    defaultValues: { 
      title: "", 
      description: "",
      targetType: "Product",
      discountType: "Percentage",
      discountValue: 0,
      priority: 0,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<PromotionFormData>();

  const watchCreateTargetType = watchCreate("targetType");
  const watchEditTargetType = watch("targetType");

  const filteredPromotions = useMemo<Promotion[]>(() => {
    if (!promotions) return [];
    return promotions.filter((promo) =>
      promo.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  const startEditing = (promotion: Promotion) => {
    setEditingPromotionId(promotion._id);
    setValue("title", promotion.title);
    setValue("description", promotion.description || "");
    setValue("targetType", promotion.targetType);
    setValue("target", promotion.target?._id || "");
    setValue("discountType", promotion.discountType);
    setValue("discountValue", promotion.discountValue);
    setValue("priority", promotion.priority);
    setValue("startDate", new Date(promotion.startDate).toISOString().slice(0, 16));
    setValue("endDate", new Date(promotion.endDate).toISOString().slice(0, 16));
    setIsEditDialogOpen(true);
  };

  const cancelEditing = () => {
    setIsEditDialogOpen(false);
    setEditingPromotionId(null);
    reset();
  };

  const onSubmit = async (data: PromotionFormData, promotionId: string) => {
    try {
      const bannerFile = data.banner && data.banner[0] ? data.banner[0] : null;
      updatePromotion(
        {
          id: promotionId,
          data: {
            ...data,
            bannerFile,
            userName: user?.username,
          },
        },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setEditingPromotionId(null);
            setEditCompanyFilter("");
            reset();
            toast.success("تم تحديث العرض بنجاح");
          },
        }
      );
    } catch (error: unknown) {
      toast.error((error as Error)?.message || "فشل تحديث العرض");
    }
  };

  const onCreateSubmit = async (data: PromotionFormData) => {
    try {
      const bannerFile = data.banner && data.banner[0] ? data.banner[0] : null;
      createPromotion(
        {
          ...data,
          bannerFile,
          userName: user?.username || "Admin",
        },
        {
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            setCreateCompanyFilter("");
            resetCreate();
            toast.success("تم إنشاء العرض بنجاح");
          },
        }
      );
    } catch (error: unknown) {
      toast.error((error as Error)?.message || "فشل إنشاء العرض");
    }
  };

  const confirmDelete = (id: string) => {
    deletePromotion(id, {
      onSuccess: () => toast.success("تم حذف العرض بنجاح"),
      onSettled: () => setDeletingPromotionId(null),
    });
  };

  const handleToggle = (id: string) => {
    toggleStatus({ id, userName: user?.username }, {
      onSuccess: (data) => {
        toast.success(`تم ${data.isActive ? "تفعيل" : "إيقاف"} العرض بنجاح`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  const renderTargetOptions = (targetType: string, companyFilter?: string) => {
    if (targetType === "Company" && companies) {
      return (companies as { _id: string; name: string }[]).map((c) => <option key={c._id} value={c._id}>{c.name}</option>);
    }
    if (targetType === "Menu" && menus) {
      type MenuType = { _id: string; name: string; company?: { _id: string } };
      const filtered = companyFilter ? (menus as MenuType[]).filter(m => m.company?._id === companyFilter) : (menus as MenuType[]);
      return filtered.map((m) => <option key={m._id} value={m._id}>{m.name}</option>);
    }
    if (targetType === "Product" && products) {
      type ProductType = { _id: string; name: string; company?: { _id: string }; menu?: { company?: { _id: string } } };
      const filtered = companyFilter ? (products as ProductType[]).filter(p => p.menu?.company?._id === companyFilter || p.company?._id === companyFilter) : (products as ProductType[]);
      return filtered.map((p) => <option key={p._id} value={p._id}>{p.name}</option>);
    }
    return <option value="">اختر...</option>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="العروض والخصومات"
        description="إدارة العروض الترويجية والخصومات على المنتجات، المنيوهات أو الشركات."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة عرض جديد</span>
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ابحث عن عرض بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl border-slate-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-right">بانر العرض</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">عنوان العرض</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الخصم</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الحالة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">المدة</TableHead>
              {isSupervisor && (
                <TableHead className="font-bold text-slate-700 text-right">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                  لا توجد عروض مسجلة حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promo: Promotion) => (
                <TableRow key={promo._id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    {(() => {
                      const bannerUrl = typeof promo.banner === 'string' ? promo.banner : promo.banner?.url;
                      return bannerUrl ? (
                        <Image
                          width={60}
                          height={40}
                          src={bannerUrl}
                          alt={promo.title}
                          className="h-10 w-16 object-cover rounded border border-slate-100"
                        />
                      ) : (
                        <div className="h-10 w-16 bg-slate-100 text-slate-400 rounded flex items-center justify-center">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    <div>{promo.title}</div>
                    <div className="text-xs text-slate-500 font-normal">
                      {promo.targetType}: {promo.target?.name || "غير محدد"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-sm font-medium">
                      <Tag className="h-3 w-3" />
                      {promo.discountType === "Percentage" && `${promo.discountValue}%`}
                      {promo.discountType === "Fixed Amount" && `-${promo.discountValue} رس`}
                      {promo.discountType === "Fixed Price" && `${promo.discountValue} رس`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-1 rounded-md w-fit ${
                        promo.status === 'Active' ? 'bg-green-100 text-green-700' :
                        promo.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {promo.status}
                      </span>
                      {promo.isActive ? (
                        <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> مفعل</span>
                      ) : (
                        <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3"/> موقوف</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    <div>من: {new Date(promo.startDate).toLocaleDateString("ar-EG")}</div>
                    <div>إلى: {new Date(promo.endDate).toLocaleDateString("ar-EG")}</div>
                  </TableCell>
                  {isSupervisor && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggle(promo._id)}
                          disabled={isToggling}
                          className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50"
                          title={promo.isActive ? "إيقاف العرض" : "تفعيل العرض"}
                        >
                          {promo.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(promo)}
                          className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingPromotionId(promo._id)}
                          className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Creation Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">إضافة عرض جديد</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل العرض وحدد المنتجات أو الأقسام المشمولة بالخصم.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">عنوان العرض</Label>
                <Input
                  {...registerCreate("title", { required: "عنوان العرض مطلوب" })}
                  placeholder="مثال: خصم الصيف"
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">الأولوية</Label>
                <Input
                  type="number"
                  {...registerCreate("priority")}
                  placeholder="0"
                  className="rounded-xl"
                />
                <span className="text-[11px] text-gray-500 leading-tight">
                  الرقم الأكبر يعني أولوية أعلى ويُطبق أولاً (مثال: الأولوية 1 تُطبق قبل 0).
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-slate-700">الوصف</Label>
              <Input
                {...registerCreate("description")}
                placeholder="وصف إضافي للعرض"
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">نوع الخصم</Label>
                <select
                  {...registerCreate("discountType")}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Percentage">نسبة مئوية (%)</option>
                  <option value="Fixed Amount">مبلغ ثابت (ج م)</option>
                  <option value="Fixed Price">سعر ثابت (ج م)</option>
                </select>
                <span className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  <strong>مبلغ ثابت:</strong> يخصم قيمة محددة (مثل 20ج) من السعر الأصلي.<br/>
                  <strong>سعر ثابت:</strong> يجعل سعر المنتج النهائي هو القيمة المدخلة مباشرة.
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">قيمة الخصم</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...registerCreate("discountValue", { required: true, min: 0 })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {watchCreateTargetType !== "Company" && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="font-semibold text-slate-700">تصفية المستهدفين حسب الشركة (اختياري)</Label>
                  <select
                    value={createCompanyFilter}
                    onChange={(e) => setCreateCompanyFilter(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="">جميع الشركات</option>
                    {companies?.map((c: { _id: string; name: string }) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">تطبيق على</Label>
                <select
                  {...registerCreate("targetType")}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Product">منتج محدد</option>
                  <option value="Menu">قائمة كاملة (منيو)</option>
                  <option value="Company">جميع منتجات الشركة</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">اختر المستهدف</Label>
                <select
                  {...registerCreate("target", { required: true })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">اختر...</option>
                  {renderTargetOptions(watchCreateTargetType, createCompanyFilter)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">تاريخ البدء</Label>
                <Input
                  type="datetime-local"
                  {...registerCreate("startDate", { required: true })}
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">تاريخ الانتهاء</Label>
                <Input
                  type="datetime-local"
                  {...registerCreate("endDate", { required: true })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-slate-700">بانر العرض (اختياري)</Label>
              <Input
                type="file"
                accept="image/*"
                {...registerCreate("banner")}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-red-600 hover:bg-red-700 text-white">
                {isCreating ? "جاري الإضافة..." : "حفظ العرض"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">تعديل العرض</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit((data) => editingPromotionId && onSubmit(data, editingPromotionId))} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">عنوان العرض</Label>
                <Input
                  {...register("title", { required: "عنوان العرض مطلوب" })}
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">الأولوية</Label>
                <Input
                  type="number"
                  {...register("priority")}
                  className="rounded-xl"
                />
                <span className="text-[11px] text-gray-500 leading-tight mt-0.5">
                  الرقم الأكبر يعني أولوية أعلى ويُطبق أولاً (مثال: الأولوية 1 تُطبق قبل 0).
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-slate-700">الوصف</Label>
              <Input
                {...register("description")}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">نوع الخصم</Label>
                <select
                  {...register("discountType")}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Percentage">نسبة مئوية (%)</option>
                  <option value="Fixed Amount">مبلغ ثابت (رس)</option>
                  <option value="Fixed Price">سعر ثابت (رس)</option>
                </select>
                <span className="text-[10px] text-gray-500 leading-tight mt-0.5">
                  <strong>مبلغ ثابت:</strong> يخصم قيمة محددة (مثل 20ج) من السعر الأصلي.<br/>
                  <strong>سعر ثابت:</strong> يجعل سعر المنتج النهائي هو القيمة المدخلة مباشرة.
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">قيمة الخصم</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("discountValue", { required: true, min: 0 })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              {watchEditTargetType !== "Company" && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="font-semibold text-slate-700">تصفية المستهدفين حسب الشركة (اختياري)</Label>
                  <select
                    value={editCompanyFilter}
                    onChange={(e) => setEditCompanyFilter(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="">جميع الشركات</option>
                    {companies?.map((c: { _id: string; name: string }) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">تطبيق على</Label>
                <select
                  {...register("targetType")}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Product">منتج محدد</option>
                  <option value="Menu">قائمة كاملة (منيو)</option>
                  <option value="Company">جميع منتجات الشركة</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">اختر المستهدف</Label>
                <select
                  {...register("target", { required: true })}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">اختر...</option>
                  {renderTargetOptions(watchEditTargetType, editCompanyFilter)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">تاريخ البدء</Label>
                <Input
                  type="datetime-local"
                  {...register("startDate", { required: true })}
                  className="rounded-xl"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="font-semibold text-slate-700">تاريخ الانتهاء</Label>
                <Input
                  type="datetime-local"
                  {...register("endDate", { required: true })}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="font-semibold text-slate-700">بانر العرض (اختياري)</Label>
              <Input
                type="file"
                accept="image/*"
                {...register("banner")}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 pt-4">
              <Button type="button" variant="outline" onClick={cancelEditing}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-red-600 hover:bg-red-700 text-white">
                {isUpdating ? "جاري الحفظ..." : "تعديل العرض"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingPromotionId} onOpenChange={(open) => !open && setDeletingPromotionId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذا العرض؟ سيتم إزالة الخصم عن جميع المنتجات المشمولة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel onClick={() => setDeletingPromotionId(null)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingPromotionId && confirmDelete(deletingPromotionId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

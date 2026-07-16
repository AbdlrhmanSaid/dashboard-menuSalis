"use client";

import { useState, useMemo } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/hooks/useCompanies";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Edit2, Trash2, Check, X, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import { Company } from "@/types/company";
import Image from "next/image";
import { slugify } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";

interface CompanyFormData {
  name: string;
  slug: string;
  description: string;
  logo?: FileList;
}

interface CreateCompanyFormData {
  name: string;
  slug: string;
  description: string;
  logo?: FileList;
}

export default function CompanyDashboard() {
  const { data: companies, isLoading } = useCompanies();
  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isUpdating } = useUpdateCompany();
  const { mutate: deleteCompany, isPending: isDeleting } = useDeleteCompany();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CompanyFormData>();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors },
  } = useForm<CreateCompanyFormData>({
    defaultValues: { name: "", slug: "", description: "" },
  });

  const filteredCompanies = useMemo<Company[]>(() => {
    if (!companies) return [] as Company[];
    return (companies as Company[]).filter((company: Company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  const startEditing = (company: Company) => {
    setEditingCompanyId(company._id);
    setValue("name", company.name);
    setValue("slug", company.slug);
    setValue("description", company.description);
  };

  const cancelEditing = () => {
    setEditingCompanyId(null);
    reset();
  };

  const onSubmit = async (data: CompanyFormData, companyId: string) => {
    try {
      const logoFile = data.logo && data.logo[0] ? data.logo[0] : null;
      updateCompany(
        {
          id: companyId,
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            logoFile,
          },
        },
        {
          onSuccess: () => {
            setEditingCompanyId(null);
            reset();
            toast.success("تم تحديث الشركة بنجاح");
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "فشل تحديث الشركة";
      toast.error(errorMessage);
    }
  };

  const onCreateSubmit = async (data: CreateCompanyFormData) => {
    try {
      const logoFile = data.logo && data.logo[0] ? data.logo[0] : null;
      createCompany(
        {
          name: data.name,
          slug: data.slug,
          description: data.description,
          logoFile,
        },
        {
          onSuccess: () => {
            setIsCreateDialogOpen(false);
            resetCreate();
            toast.success("تم إنشاء الشركة بنجاح");
          },
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "فشل إنشاء الشركة";
      toast.error(errorMessage);
    }
  };

  const confirmDelete = (id: string) => {
    deleteCompany(id, {
      onSuccess: () => {
        toast.success("تم حذف الشركة بنجاح");
      },
      onSettled: () => setDeletingCompanyId(null),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="إدارة الشركات"
        description="إدارة وإضافة الشركات والمنشآت وتعديل بياناتها وشعاراتها."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة شركة جديدة</span>
            </Button>
          )
        }
      />

      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ابحث عن شركة بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* Companies Data Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-right">شعار الشركة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">اسم الشركة</TableHead>
              <TableHead className="font-bold text-slate-700 text-right">الوصف</TableHead>
              {isSupervisor && (
                <TableHead className="font-bold text-slate-700 text-right">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-slate-400">
                  لا توجد شركات مسجلة حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company: Company) => (
                <TableRow key={company._id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  {editingCompanyId === company._id ? (
                    // Inline Edit row
                    <>
                      <TableCell>
                        <Input
                          type="file"
                          accept="image/*"
                          {...register("logo")}
                          className="max-w-[200px]"
                        />
                        {errors.logo && (
                          <p className="mt-1 text-xs text-red-500">{errors.logo.message}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register("name", {
                            required: "اسم الشركة مطلوب",
                            minLength: { value: 2, message: "2 أحرف على الأقل" },
                          })}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register("description", {
                            required: "الوصف مطلوب",
                            minLength: { value: 5, message: "5 أحرف على الأقل" },
                          })}
                        />
                        {errors.description && (
                          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating}
                            onClick={handleSubmit((data) => onSubmit(data, company._id))}
                            className="h-8 w-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                            title="حفظ"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating}
                            onClick={cancelEditing}
                            className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            title="إلغاء"
                          >
                            <X className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    // Regular Display row
                    <>
                      <TableCell>
                        {company.logo ? (
                          <Image
                            width={44}
                            height={44}
                            src={company.logo}
                            alt={company.name}
                            className="h-11 w-11 object-cover rounded-xl border border-slate-100 shadow-inner"
                          />
                        ) : (
                          <div className="h-11 w-11 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-xs font-semibold">
                            لا يوجد
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">{company.name}</TableCell>
                      <TableCell className="text-slate-500 max-w-[300px] truncate" title={company.description}>
                        {company.description}
                      </TableCell>
                      {isSupervisor && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditing(company)}
                              className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              title="تعديل الشركة"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCompanyId(company._id)}
                              className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                              title="حذف الشركة"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Creation Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">إضافة شركة جديدة</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل الشركة الجديدة والبيانات المطلوبة لرفع شعارها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createName" className="font-semibold text-slate-700">اسم الشركة</Label>
              <Input
                id="createName"
                {...registerCreate("name", {
                  required: "اسم الشركة مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم الشركة (مثال: شركة ساليس للمطاعم)"
                disabled={isCreating}
                onChange={(e) => {
                  registerCreate("name").onChange(e);
                  setValueCreate("slug", slugify(e.target.value), {
                    shouldValidate: true,
                  });
                }}
                className="rounded-xl border-slate-200"
              />
              {createErrors.name && (
                <p className="text-xs text-red-500">{createErrors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createDescription" className="font-semibold text-slate-700">الوصف</Label>
              <Input
                id="createDescription"
                {...registerCreate("description", {
                  required: "الوصف مطلوب",
                  minLength: { value: 5, message: "5 أحرف على الأقل" },
                })}
                placeholder="وصف مختصر لنشاط الشركة"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.description && (
                <p className="text-xs text-red-500">{createErrors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createLogo" className="font-semibold text-slate-700">شعار الشركة (اختياري)</Label>
              <Input
                id="createLogo"
                type="file"
                accept="image/*"
                {...registerCreate("logo")}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreate();
                }}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                {isCreating ? "جاري الإضافة..." : "إضافة الشركة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCompanyId} onOpenChange={(open) => !open && setDeletingCompanyId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذه الشركة؟ سيؤدي هذا إلى إلغاء ربط الفروع والمنيوهات المرتبطة بها نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel onClick={() => setDeletingCompanyId(null)} className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingCompanyId && confirmDelete(deletingCompanyId)}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

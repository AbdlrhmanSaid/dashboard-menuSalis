"use client";

import { useState, useMemo } from "react";
import {
  useMenus,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
} from "@/hooks/useMenus";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import { Menu, CreateMenuRequest } from "@/types/menu";
import { Company } from "@/types/company";
import MenuTable from "@/components/dashboard/MenuTable";
import PageHeader from "@/components/dashboard/PageHeader";

export default function MenuPageManage() {
  const { data: menus, isLoading: menusLoading } = useMenus();
  const { mutate: createMenu, isPending: isCreating } = useCreateMenu();
  const { mutate: updateMenu, isPending: isUpdating } = useUpdateMenu();
  const { mutate: deleteMenu, isPending: isDeleting } = useDeleteMenu();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompanyId, setFilterCompanyId] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companySearch, setCompanySearch] = useState("");

  // Form for creation
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors },
  } = useForm<CreateMenuRequest>({
    defaultValues: { name: "", description: "", company: "" },
  });

  const filteredMenus = useMemo(() => {
    if (!menus) return [];
    return (menus as Menu[]).filter((menu) => {
      const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!filterCompanyId) return matchesSearch;
      // Handle both populated object and raw string
      const companyId =
        typeof menu.company === "string"
          ? menu.company
          : (menu.company as any)?._id?.toString?.() ?? "";
      const matchesCompany = companyId === filterCompanyId;
      return matchesSearch && matchesCompany;
    });
  }, [menus, searchTerm, filterCompanyId]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    return (companies as Company[]).filter((company) =>
      company.name.toLowerCase().includes(companySearch.toLowerCase())
    );
  }, [companies, companySearch]);

  const onCreateSubmit = (data: CreateMenuRequest) => {
    createMenu(
      { name: data.name, description: data.description, company: data.company },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          resetCreate();
          setSelectedCompany("");
          setCompanySearch("");
        },
      }
    );
  };

  const handleUpdate = (id: string, data: any, callback: () => void) => {
    updateMenu(
      { id, data },
      {
        onSuccess: () => {
          callback();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteMenu(id);
  };

  if (menusLoading || companiesLoading) {
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
        title="إدارة القوائم"
        description="إنشاء وتعديل قوائم الطعام (المنيو) وربطها بالشركات وتوليد رمز الاستجابة السريعة (QR Code) الموحد للشركة لعرض قوائمها كفئات."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة منيو جديد</span>
            </Button>
          )
        }
      />

      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ابحث عن منيو بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl border-slate-200 bg-white"
          />
        </div>

        {/* Company Filter */}
        <select
          value={filterCompanyId}
          onChange={(e) => setFilterCompanyId(e.target.value)}
          className="rounded-xl border border-slate-200 text-slate-700 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 shadow-sm min-w-[160px] cursor-pointer"
        >
          <option value="">كل الشركات</option>
          {companies?.map((c: Company) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Reset Filters Button */}
        {(filterCompanyId || searchTerm) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterCompanyId("");
              setSearchTerm("");
            }}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
          >
            إعادة تعيين الفلاتر
          </Button>
        )}
      </div>

      {/* Menus Table Container */}
      <MenuTable
        menus={filteredMenus}
        companies={companies || []}
        isSupervisor={isSupervisor}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Creation Dialog Modal */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">
              إضافة منيو جديد
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل المنيو الجديد واختر الشركة التابع لها لربط القائمة بها.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createName" className="font-semibold text-slate-700">اسم المنيو</Label>
              <Input
                id="createName"
                {...registerCreate("name", {
                  required: "اسم المنيو مطلوب",
                  minLength: { value: 2, message: "2 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم المنيو (مثال: منيو الغداء)"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.name && (
                <p className="text-xs text-red-500">{createErrors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createDescription" className="font-semibold text-slate-700">وصف المنيو</Label>
              <Input
                id="createDescription"
                {...registerCreate("description", {
                  required: "الوصف مطلوب",
                  minLength: { value: 5, message: "5 أحرف على الأقل" },
                })}
                placeholder="وصف مختصر لمحتويات المنيو"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.description && (
                <p className="text-xs text-red-500">{createErrors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="createCompany" className="font-semibold text-slate-700">الشركة</Label>
              <Command className="border rounded-xl bg-white">
                <CommandInput
                  placeholder="ابحث عن شركة..."
                  value={companySearch}
                  onValueChange={setCompanySearch}
                  disabled={isCreating}
                />
                <CommandList>
                  <CommandEmpty>لا توجد شركات مسجلة</CommandEmpty>
                  <CommandGroup>
                    {filteredCompanies.map((company: Company) => (
                      <CommandItem
                        key={company._id}
                        onSelect={() => {
                          setSelectedCompany(company._id);
                          setValueCreate("company", company._id);
                          setCompanySearch(company.name);
                        }}
                      >
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {createErrors.company && (
                <p className="text-xs text-red-500">اختيار الشركة مطلوب</p>
              )}
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreate();
                  setSelectedCompany("");
                  setCompanySearch("");
                }}
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCreating} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                {isCreating ? "جاري الإضافة..." : "إضافة المنيو"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

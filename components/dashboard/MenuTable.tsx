"use client";
import React, { useState } from "react";
import { Menu, UpdateMenuRequest } from "@/types/menu";
import { Company } from "@/types/company";
import { useForm } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Edit2,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface MenuTableProps {
  menus: Menu[];
  companies: Company[];
  isSupervisor: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onUpdate: (id: string, data: UpdateMenuRequest, callback: () => void) => void;
  onDelete: (id: string) => void;
}

interface MenuFormData {
  name: string;
  description: string;
  company: string;
}

export default function MenuTable({
  menus,
  companies,
  isSupervisor,
  isUpdating,
  isDeleting,
  onUpdate,
  onDelete,
}: MenuTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Auto-complete / Search for edit company dropdown
  const [editCompanySearch, setEditCompanySearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MenuFormData>();

  const startEditing = (menu: Menu) => {
    setEditingId(menu._id);
    reset({
      name: menu.name,
      description: menu.description,
      company: menu.company._id,
    });
    setEditCompanySearch(menu.company.name);
    setIsEditDialogOpen(true);
  };

  const cancelEditing = () => {
    setIsEditDialogOpen(false);
    setEditingId(null);
    reset();
  };

  const onSubmitForm = (data: MenuFormData) => {
    if (!editingId) return;
    onUpdate(
      editingId,
      {
        name: data.name,
        description: data.description,
        company: data.company,
      },
      () => {
        setIsEditDialogOpen(false);
        setEditingId(null);
        reset();
        toast.success("تم تحديث المنيو بنجاح");
      },
    );
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(editCompanySearch.toLowerCase()),
  );

  return (
    <>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-gray-700 text-right">
                اسم المنيو
              </TableHead>
              <TableHead className="font-bold text-gray-700 text-right">
                الوصف
              </TableHead>
              <TableHead className="font-bold text-gray-700 text-right">
                الشركة
              </TableHead>
              <TableHead className="font-bold text-gray-700 text-right">
                عدد المنتجات
              </TableHead>
              <TableHead className="font-bold text-gray-700 text-right">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menus.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-gray-400"
                >
                  لا توجد منيوهات مسجلة حالياً.
                </TableCell>
              </TableRow>
            ) : (
              menus.map((menu) => (
                <TableRow
                  key={menu._id}
                  className="hover:bg-gray-50/50 transition-colors duration-150"
                >
                  <TableCell className="font-semibold text-gray-800">
                    {menu.name}
                  </TableCell>
                  <TableCell
                    className="text-gray-500 max-w-[250px] truncate"
                    title={menu.description}
                  >
                    {menu.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {menu.company?.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-600">
                    {menu.products?.length || 0} منتجات
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {isSupervisor ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(menu)}
                            className="h-8 w-8 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            title="تعديل المنيو"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingId(menu._id)}
                            className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="حذف المنيو"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">
                          لا توجد صلاحيات
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Menu Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">
              تعديل المنيو
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              تعديل اسم المنيو ووصفه والشركة المرتبط بها.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editName" className="font-semibold text-slate-700">
                اسم المنيو
              </Label>
              <Input
                id="editName"
                {...register("name", {
                  required: "اسم المنيو مطلوب",
                  minLength: {
                    value: 2,
                    message: "2 أحرف على الأقل",
                  },
                })}
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editDescription" className="font-semibold text-slate-700">
                وصف المنيو
              </Label>
              <Input
                id="editDescription"
                {...register("description", {
                  required: "الوصف مطلوب",
                  minLength: {
                    value: 5,
                    message: "5 أحرف على الأقل",
                  },
                })}
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editCompany" className="font-semibold text-slate-700">
                الشركة
              </Label>
              <Command className="border rounded-xl bg-white">
                <CommandInput
                  placeholder="ابحث عن شركة..."
                  value={editCompanySearch}
                  onValueChange={setEditCompanySearch}
                  disabled={isUpdating}
                />
                <CommandList>
                  <CommandEmpty>لا توجد شركات مسجلة</CommandEmpty>
                  <CommandGroup>
                    {filteredCompanies.map((company) => (
                      <CommandItem
                        key={company._id}
                        onSelect={() => {
                          setValue("company", company._id);
                          setEditCompanySearch(company.name);
                        }}
                      >
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {errors.company && (
                <p className="text-xs text-red-500">اختيار الشركة مطلوب</p>
              )}
            </div>

            <DialogFooter className="flex gap-2 justify-start mt-6 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isUpdating ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              هل أنت متأكد من حذف هذا المنيو؟ لن تتمكن من التراجع عن هذا الإجراء
              وسيتم فصل المنتجات المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel
              onClick={() => setDeletingId(null)}
              className="rounded-xl"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingId && onDelete(deletingId)}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

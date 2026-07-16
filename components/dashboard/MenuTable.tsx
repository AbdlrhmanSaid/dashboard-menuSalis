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
  Check,
  X,
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
  };

  const cancelEditing = () => {
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
                  {editingId === menu._id ? (
                    // Editing Mode Row
                    <>
                      <TableCell>
                        <Input
                          {...register("name", {
                            required: "اسم المنيو مطلوب",
                            minLength: {
                              value: 2,
                              message: "2 أحرف على الأقل",
                            },
                          })}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register("description", {
                            required: "الوصف مطلوب",
                            minLength: {
                              value: 5,
                              message: "5 أحرف على الأقل",
                            },
                          })}
                        />
                        {errors.description && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.description.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Command className="border rounded-xl bg-white max-w-[200px]">
                          <CommandInput
                            placeholder="ابحث عن شركة..."
                            value={editCompanySearch}
                            onValueChange={setEditCompanySearch}
                          />
                          <CommandList>
                            <CommandEmpty>لا توجد شركات</CommandEmpty>
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
                          <p className="mt-1 text-xs text-red-500">
                            اختيار الشركة مطلوب
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{menu.products?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating}
                            onClick={handleSubmit(onSubmitForm)}
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
                    // Regular Display Row
                    <>
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
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>


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

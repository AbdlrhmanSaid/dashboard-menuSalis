"use client";

import { useState, useMemo } from "react";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  useCreateUser,
} from "@/hooks/useUsers";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Edit2, Trash2, Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import Loading from "@/components/Loading";
import PageHeader from "@/components/dashboard/PageHeader";

interface UserFormData {
  username: string;
  role?: string;
}

interface CreateUserFormData {
  username: string;
  role: string;
  password: string;
}

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { user } = useAuth();
  const isSupervisor = user?.role === "supervisor";
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>();

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    setValue: setValueCreate,
    formState: { errors: createErrors },
  } = useForm<CreateUserFormData>({
    defaultValues: { role: "user" },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const startEditing = (user: {
    _id: string;
    username: string;
    role: string;
  }) => {
    setEditingUserId(user._id);
    setValue("username", user.username);
    if (isSupervisor) {
      setValue("role", user.role);
    }
    setIsEditDialogOpen(true);
  };

  const cancelEditing = () => {
    setIsEditDialogOpen(false);
    setEditingUserId(null);
    reset();
  };

  const onSubmit = (data: UserFormData, userId: string) => {
    updateUser(
      { id: userId, data: { username: data.username, role: data.role } },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingUserId(null);
          reset();
        },
      },
    );
  };

  const confirmDelete = (userId: string) => {
    deleteUser(userId);
    setDeletingUserId(null);
  };

  const onCreateSubmit = (data: CreateUserFormData) => {
    createUser(
      { username: data.username, password: data.password, role: data.role },
      {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
          resetCreate();
        },
      },
    );
  };

  const getRoleLabel = (role?: string) => {
    if (role === "supervisor") return "مدير النظام";
    if (role === "admin") return "مشرف";
    return "مستخدم عادي";
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
        title="إدارة المستخدمين"
        description="إضافة وتعديل حسابات مستخدمي لوحة التحكم وتوزيع الأدوار والصلاحيات."
        action={
          isSupervisor && (
            <Button
              disabled={isCreating}
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-5 px-4"
            >
              <Plus className="h-5 w-5" />
              <span>إضافة مستخدم جديد</span>
            </Button>
          )
        }
      />

      {/* Top action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ابحث عن مستخدم بالاسم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rounded-xl border-slate-200"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-slate-200">
        <Table className="min-w-[650px]">
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="font-bold text-slate-700 text-right">
                اسم المستخدم
              </TableHead>
              <TableHead className="font-bold text-slate-700 text-right">
                صلاحية الحساب (الدور)
              </TableHead>
              {isSupervisor && (
                <TableHead className="font-bold text-slate-700 text-right">
                  الإجراءات
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isSupervisor ? 3 : 2}
                  className="py-12 text-center text-slate-400"
                >
                  لا يوجد مستخدمون مسجلون حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((item) => (
                <TableRow
                  key={item._id}
                  className="hover:bg-slate-50/50 transition-colors duration-150"
                >
                  <TableCell className="font-semibold text-slate-800">
                    {item.username}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold ${
                        item.role === "supervisor"
                          ? "bg-red-50 text-red-700 border border-red-100"
                          : item.role === "admin"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {getRoleLabel(item.role)}
                    </span>
                  </TableCell>
                  {isSupervisor && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(item)}
                          className="h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          title="تعديل المستخدم"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingUserId(item._id)}
                          className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="حذف المستخدم"
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
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">
              إضافة مستخدم جديد
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              أدخل تفاصيل حساب المستخدم الجديد والصلاحية المحددة له.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitCreate(onCreateSubmit)}
            className="space-y-4 mt-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="createUsername"
                className="font-semibold text-slate-700"
              >
                اسم المستخدم
              </Label>
              <Input
                id="createUsername"
                {...registerCreate("username", {
                  required: "اسم المستخدم مطلوب",
                  minLength: { value: 3, message: "3 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم المستخدم"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.username && (
                <p className="text-xs text-red-500">
                  {createErrors.username.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="createPassword"
                className="font-semibold text-slate-700"
              >
                كلمة المرور
              </Label>
              <Input
                id="createPassword"
                type="password"
                {...registerCreate("password", {
                  required: "كلمة المرور مطلوبة",
                  minLength: { value: 6, message: "6 أحرف على الأقل" },
                })}
                placeholder="أدخل كلمة المرور السرية"
                disabled={isCreating}
                className="rounded-xl border-slate-200"
              />
              {createErrors.password && (
                <p className="text-xs text-red-500">
                  {createErrors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="createRole"
                className="font-semibold text-slate-700"
              >
                الدور والصلاحية
              </Label>
              <Select
                onValueChange={(value) => setValueCreate("role", value)}
                defaultValue="user"
                disabled={isCreating}
              >
                <SelectTrigger className="rounded-xl border-slate-200">
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي (عرض فقط)</SelectItem>
                  <SelectItem value="admin">
                    مشرف الفروع (تفعيل/تعطيل)
                  </SelectItem>
                  <SelectItem value="supervisor">
                    مدير النظام (كامل الصلاحيات)
                  </SelectItem>
                </SelectContent>
              </Select>
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
              <Button
                type="submit"
                disabled={isCreating}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {isCreating ? "جاري الإضافة..." : "إضافة المستخدم"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-bold text-slate-900">
              تعديل حساب المستخدم
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              تعديل اسم المستخدم ودوره/صلاحياته في لوحة التحكم.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit((data) => editingUserId && onSubmit(data, editingUserId))} className="space-y-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="editUsername" className="font-semibold text-slate-700">
                اسم المستخدم
              </Label>
              <Input
                id="editUsername"
                {...register("username", {
                  required: "اسم المستخدم مطلوب",
                  minLength: { value: 3, message: "3 أحرف على الأقل" },
                })}
                placeholder="أدخل اسم المستخدم"
                disabled={isUpdating}
                className="rounded-xl border-slate-200"
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {isSupervisor && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="editRole" className="font-semibold text-slate-700">
                  الدور والصلاحية
                </Label>
                <Select
                  onValueChange={(value) => setValue("role", value)}
                  defaultValue={users?.find((u) => u._id === editingUserId)?.role || "user"}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم عادي (عرض فقط)</SelectItem>
                    <SelectItem value="admin">مشرف الفروع (تفعيل/تعطيل)</SelectItem>
                    <SelectItem value="supervisor">مدير النظام (كامل الصلاحيات)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingUserId}
        onOpenChange={(open) => !open && setDeletingUserId(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader className="text-right">
            <AlertDialogTitle className="text-lg font-bold text-slate-900">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              هل أنت متأكد من حذف هذا الحساب نهائياً؟ هذا الإجراء لا يمكن
              التراجع عنه وسيفقد المستخدم إمكانية الدخول للنظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 justify-start mt-4">
            <AlertDialogCancel
              onClick={() => setDeletingUserId(null)}
              className="rounded-xl"
            >
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => deletingUserId && confirmDelete(deletingUserId)}
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

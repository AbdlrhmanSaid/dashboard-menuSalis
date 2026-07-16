"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useUpdatePassword } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import { ShieldCheck, User, KeyRound } from "lucide-react";

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { mutate: updatePassword, isPending } = useUpdatePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>();

  const onSubmit = (data: PasswordFormData) => {
    if (user?.id) {
      updatePassword(
        {
          id: user.id,
          data: {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
          },
        },
        {
          onSuccess: () => {
            reset();
            toast.success("تم تحديث كلمة المرور بنجاح");
          },
        }
      );
    }
  };

  const getRoleLabel = (role?: string) => {
    if (role === "supervisor") return "مدير النظام";
    if (role === "admin") return "مشرف الفروع";
    return "مستخدم عادي";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="إعدادات الحساب"
        description="إدارة تفاصيل حسابك وتحديث كلمة المرور لتعزيز أمان الحساب."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Info Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-red-600" />
              <span>معلومات الحساب</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">اسم المستخدم</span>
                <div className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl p-3">
                  {user?.username || "غير متوفر"}
                </div>
              </div>
              
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">نوع الصلاحية</span>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-100">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{getRoleLabel(user?.role)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="h-5 w-5 text-red-600" />
              <span>تغيير كلمة المرور</span>
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="oldPassword" className="font-semibold text-slate-700">كلمة المرور القديمة</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="أدخل كلمة المرور القديمة لحسابك"
                  {...register("oldPassword", {
                    required: "كلمة المرور القديمة مطلوبة",
                    minLength: {
                      value: 6,
                      message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
                    },
                  })}
                  className="rounded-xl border-slate-200 focus:border-red-600"
                />
                {errors.oldPassword && (
                  <p className="text-xs text-red-500">{errors.oldPassword.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword" className="font-semibold text-slate-700">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة المراد تعيينها"
                  {...register("newPassword", {
                    required: "كلمة المرور الجديدة مطلوبة",
                    minLength: {
                      value: 6,
                      message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
                    },
                  })}
                  className="rounded-xl border-slate-200 focus:border-red-600"
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending || !user}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-5.5"
                >
                  {isPending ? "جاري التحديث..." : "حفظ التغييرات الجديدة"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

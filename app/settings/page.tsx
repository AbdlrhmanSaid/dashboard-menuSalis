"use client";

import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useUpdatePassword } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowRight, ShieldCheck, User, KeyRound } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="mx-auto max-w-2xl space-y-6">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة للوحة التحكم</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 bg-red-600 rounded-full" />
            <span className="text-sm font-bold text-slate-800">منيو ساليس</span>
          </div>
        </div>

        {/* Main Settings Card */}
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
            <CardTitle className="text-xl font-bold text-slate-900">إعدادات الحساب</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              إدارة الأمان والتحقق وتغيير كلمة المرور الخاصة بك.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Account Metadata Row */}
            <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">اسم المستخدم</span>
                  <span className="text-sm font-bold text-slate-800">{user?.username || "غير متوفر"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 block">الدور / الصلاحية</span>
                  <span className="inline-flex items-center rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-100 mt-0.5">
                    {getRoleLabel(user?.role)}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <KeyRound className="h-5 w-5 text-red-600" />
                <span>تعديل كلمة المرور</span>
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="oldPassword" className="font-semibold text-slate-700">كلمة المرور الحالية</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    placeholder="أدخل كلمة المرور الحالية"
                    {...register("oldPassword", {
                      required: "كلمة المرور الحالية مطلوبة",
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
                    placeholder="أدخل كلمة المرور الجديدة"
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
                    className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold py-5.5"
                  >
                    {isPending ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

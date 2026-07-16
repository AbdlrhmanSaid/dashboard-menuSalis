"use client";

import { useLogin } from "@/hooks/useLogin";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { KeyRound, User, Lock, ArrowLeft } from "lucide-react";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginForm() {
  const { setUser } = useAuth();
  const { mutate, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const router = useRouter();

  const onSubmit = (data: LoginFormData) => {
    mutate(data, {
      onSuccess: (response) => {
        setUser(response.user);
        router.push("/");
      },
    });
  };

  return (
    <div
      className="flex items-center justify-center bg-slate-50/30 px-4 py-12 sm:px-6 lg:px-8 min-h-[calc(100vh-68px)] relative overflow-hidden"
      dir="rtl"
    >
      {/* Decorative premium radial gradients for modern depth */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-100/20 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-red-200/10 blur-3xl -z-10" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="h-6 w-1.5 bg-red-600 rounded-full" />
            <span className="text-2xl font-black tracking-tight text-slate-900">منيو ساليس</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto leading-relaxed">
            سجل الدخول لإدارة الفروع والمنيوات والمنتجات بكل سهولة.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-7 md:p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 border border-red-100/50 flex items-center justify-center shadow-inner">
              <KeyRound className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-extrabold text-slate-800">تسجيل الدخول للنظام</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username field */}
            <div className="flex flex-col gap-1.5 text-right">
              <Label htmlFor="username" className="font-bold text-xs text-slate-700">
                اسم المستخدم
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم الخاص بك"
                  {...register("username", { required: "اسم المستخدم مطلوب" })}
                  className="pr-10 h-11 rounded-xl border-slate-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 bg-white placeholder:text-slate-400 text-sm font-medium"
                />
              </div>
              {errors.username && (
                <p className="text-[11px] text-red-500 font-bold mt-0.5">{errors.username.message}</p>
              )}
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5 text-right">
              <Label htmlFor="password" className="font-bold text-xs text-slate-700">
                كلمة المرور
              </Label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور الخاصة بك"
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                    minLength: {
                      value: 6,
                      message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
                    },
                  })}
                  className="pr-10 h-11 rounded-xl border-slate-200 focus:border-red-600 focus:ring-2 focus:ring-red-600/10 bg-white placeholder:text-slate-400 text-sm font-medium"
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-500 font-bold mt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit button */}
            <div className="pt-3">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-sm shadow-red-600/10 flex items-center justify-center gap-2"
              >
                <span>{isPending ? "جاري التحقق وتسجيل الدخول..." : "تسجيل الدخول"}</span>
                {!isPending && <ArrowLeft className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

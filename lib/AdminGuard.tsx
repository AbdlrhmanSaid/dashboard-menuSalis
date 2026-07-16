"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // wait for auth resolution

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin" && user.role !== "supervisor") {
      router.push("/");
      toast.error("غير مصرح لك بالدخول لهذه الصفحة");
    }
  }, [user, isLoading, router]);

  if (
    isLoading ||
    !user ||
    (user.role !== "admin" && user.role !== "supervisor")
  ) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default AdminGuard;

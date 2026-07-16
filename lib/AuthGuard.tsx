"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/Loading";

interface AuthGuardProps {
  children: React.ReactNode;
  requiresAuth: boolean;
}

export default function AuthGuard({
  children,
  requiresAuth = true,
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // wait until auth resolves

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (requiresAuth) {
      if (!token || !user) {
        router.push("/login");
      }
    } else {
      if (token && user && pathname === "/login") {
        router.push("/");
      }
    }
  }, [user, pathname, router, requiresAuth, isLoading]);

  // Show loading while determining auth state
  if (isLoading) {
    return <Loading />;
  }

  if (
    (requiresAuth && !user) ||
    (!requiresAuth && user && pathname === "/login")
  ) {
    return <Loading />;
  }

  return <>{children}</>;
}

import React from "react";
import LoginForm from "@/components/LoginForm";
import AuthGuard from "@/lib/AuthGuard";

const page = () => {
  return (
    <AuthGuard requiresAuth={false}>
      <LoginForm />
    </AuthGuard>
  );
};

export default page;

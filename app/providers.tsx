"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{ duration: 1000 }} />
      <AuthProvider>
        <NavBar />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default Providers;

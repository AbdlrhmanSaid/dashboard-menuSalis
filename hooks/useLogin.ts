import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/authService";
import { setAuthToken } from "@/lib/axios";
import toast from "react-hot-toast";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setAuthToken(data.token);
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تسجيل الدخول";
      toast.error(message);
    },
  });
};

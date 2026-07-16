import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
} from "@/services/userService";
import toast from "react-hot-toast";

interface UserResponse {
  _id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

interface CreateUserResponse {
  message: string;
  user: UserResponse;
}

interface UpdateUserRequest {
  username?: string;
  role?: string;
}

interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const useUsers = () => {
  return useQuery<UserResponse[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: !!localStorage?.getItem("token"), // Only run if token exists
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<CreateUserResponse, Error, CreateUserRequest>({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل إنشاء المستخدم";
      toast.error(message);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation<
    UserResponse,
    Error,
    { id: string; data: UpdateUserRequest }
  >({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم تحديث المستخدم بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث المستخدم";
      toast.error(message);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("تم حذف المستخدم بنجاح");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل حذف المستخدم";
      toast.error(message);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation<void, Error, { id: string; data: UpdatePasswordRequest }>({
    mutationFn: ({ id, data }) => updatePassword(id, data),
    onSuccess: () => {},
    onError: (error: any) => {
      const message = error.response?.data?.message || "فشل تحديث كلمة المرور";
      toast.error(message);
    },
  });
};

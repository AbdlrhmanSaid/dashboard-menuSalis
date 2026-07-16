import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/authService";
import toast from "react-hot-toast";

interface UserResponse {
  _id: string;
  username: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const useCurrentUser = () => {
  const query = useQuery<UserResponse, Error>({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!localStorage?.getItem("token"),
  });

  if (query.error) {
    const error: any = query.error;
    const message = error.response?.data?.message || "فشل جلب بيانات المستخدم";
    toast.error(message);
  }

  return query;
};

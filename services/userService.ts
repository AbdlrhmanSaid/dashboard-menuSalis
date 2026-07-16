import api from "@/lib/axios";

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

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", credentials);
  return response.data;
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await api.get<UserResponse>("/auth/me");
  return response.data;
};

export const getUsers = async (): Promise<UserResponse[]> => {
  const response = await api.get<UserResponse[]>("/users");
  return response.data;
};

export const createUser = async (
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  const response = await api.post<CreateUserResponse>("/users", userData);
  return response.data;
};

export const updateUser = async (
  id: string,
  userData: UpdateUserRequest
): Promise<UserResponse> => {
  const response = await api.put<UserResponse>(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const updatePassword = async (
  id: string,
  passwordData: UpdatePasswordRequest
): Promise<void> => {
  await api.put(`/users/${id}/password`, passwordData);
};

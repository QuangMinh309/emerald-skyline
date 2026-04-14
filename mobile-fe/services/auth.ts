import type { AuthResponse, AuthUser } from "@/types/auth";
import { api } from "@/services/api";

export const login = async (email: string, password: string) => {
  console.log("Attempting login with email:", email);
  const response = await api.post("/auth/login", { email, password });
  console.log("Login response:", response.data);
  return response.data.data as AuthResponse;
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data.data as AuthUser;
};

export const changePassword = async (payload: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await api.post("/auth/change-password", payload);
  return response.data.data;
};

export const logout = async () => {
  await api.post("/auth/logout");
};
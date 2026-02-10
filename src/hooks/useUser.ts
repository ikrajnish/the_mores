"use client";

import { useAuth } from "@/context/AuthContext";

export function useUser() {
  const { user, loading, login, logout, refreshUser } = useAuth();
  return { user, loading, login, logout, refreshUser };
}

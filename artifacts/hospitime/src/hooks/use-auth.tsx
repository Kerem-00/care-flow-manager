import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { User } from "@workspace/api-client-react";
import { useGetCurrentUser, useLogout, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  isLogoutPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useGetCurrentUser({
    query: {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      queryKey: getGetCurrentUserQueryKey(),
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
        setLocation("/");
      }
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const actualUser = (error || !user) ? null : user;

  return (
    <AuthContext.Provider value={{ user: actualUser, isLoading, logout: handleLogout, isLogoutPending: logoutMutation.isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

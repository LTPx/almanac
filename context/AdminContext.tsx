"use client";

import type { User } from "@/lib/types";
import React, { createContext, useContext, useState } from "react";

interface AdminContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AdminContext = createContext<AdminContextType | undefined>(
  undefined
);

export const AdminProvider = ({
  user: initialUser,
  children
}: {
  user: User | null;
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  return (
    <AdminContext.Provider value={{ user, setUser }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within a UserProvider");
  return context.user;
};

export const useSetAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useSetAdmin must be used within a UserProvider");
  return context.setUser;
};

import React, { createContext, useContext, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string,
  avatarUrl: string
} | null;

type UserContextType = {
  user: User;
  setUser: (u: User) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  function clearUser() {
    setUser(null);
  }

  return (
  <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
  </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
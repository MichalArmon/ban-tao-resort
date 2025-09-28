import { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, role: 'guest' | 'admin' }

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? "guest",
      login: (u) => setUser(u),
      logout: () => setUser(null),
    }),
    [user]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

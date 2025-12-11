// 📁 src/context/UserContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { GLOBAL_API_BASE, get } from "../config/api";
import { useBirthChart } from "./BirthChartContext";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

// API base
const AUTH_URL = `${GLOBAL_API_BASE}/auth`;
const USERS_URL = `${GLOBAL_API_BASE}/users`;

/* ============================================================
   🟢 NORMALIZE USER — Ensures _id always exists!
============================================================ */
const normalizeUser = (u) => ({
  _id: u._id || u.id,
  id: u._id || u.id,
  email: u.email || "",
  role: u.role || "user",
  name: {
    first: u.name?.first || u.firstName || "",
    last: u.name?.last || u.lastName || "",
  },
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ ADMIN USERS ⭐
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  // ⭐ ASTROLOGY CONTEXT ⭐
  const { showChart, setProfileOpen } = useBirthChart();

  /* ============================================================
     🔄 AUTO LOGIN FROM LOCAL STORAGE
 ============================================================ */
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      const parsed = JSON.parse(savedUser);
      setToken(savedToken);
      setUser(normalizeUser(parsed));
    }

    setLoading(false);
  }, []);

  /* ============================================================
     📌 Helper: Save user+token
 ============================================================ */
  const saveAuth = (userData, jwtToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    setUser(userData);
    setToken(jwtToken);
  };

  /* ============================================================
     ⭐ LOAD BIRTH CHART AFTER LOGIN
 ============================================================ */
  const loadBirthChart = useCallback(
    async (jwtToken) => {
      try {
        const res = await get("/astro/birth-chart", jwtToken);

        if (res?.svg) {
          // 🎉 אם יש מפת לידה — נראה אותה
          showChart(res.svg);
        }
      } catch (err) {
        console.error("Birth chart fetch error:", err);
        // ❗ לא פותחים את הטופס אוטומטית יותר!
      }
    },
    [showChart, setProfileOpen]
  );

  /* ============================================================
     🔐 LOGIN (email + password)
 ============================================================ */
  const login = useCallback(
    async (email, password) => {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      const userObj = normalizeUser(data.data.user);
      saveAuth(userObj, data.token);

      // 🟣 נטען מפת לידה
      loadBirthChart(data.token);

      return userObj;
    },
    [loadBirthChart]
  );

  /* ============================================================
     📝 SIGNUP
 ============================================================ */
  const signup = useCallback(
    async (formData) => {
      const res = await fetch(`${AUTH_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Signup failed");

      const userObj = normalizeUser(data.data.user);
      saveAuth(userObj, data.token);

      // 🟣 נטען מפת לידה
      loadBirthChart(data.token);

      return userObj;
    },
    [loadBirthChart]
  );

  /* ============================================================
     🚪 LOGOUT
 ============================================================ */
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("seenBirthChartIntro");
    setUser(null);
    setToken(null);
  }, []);

  /* ============================================================
     ⭐ ADMIN: GET ALL USERS
 ============================================================ */
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);

      const res = await fetch(USERS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load users");

      setUsers(data);
    } catch (err) {
      setUsersError(err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  /* ============================================================
     ⭐ ADMIN: DELETE USER
 ============================================================ */
  const deleteUser = useCallback(
    async (id) => {
      const res = await fetch(`${USERS_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      fetchUsers();
      return true;
    },
    [token, fetchUsers]
  );

  /* ============================================================
     CONTEXT VALUE
 ============================================================ */
  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isLoggedIn: !!user,
    isAdmin: user?.role === "admin",
    role: user?.role || null,

    // ⭐ ADMIN USERS ⭐
    users,
    loadingUsers,
    usersError,
    fetchUsers,
    deleteUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

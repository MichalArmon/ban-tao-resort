import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function RequireAuth({ allow }) {
  const { user, role, isLoggedIn, loading } = useUser();
  const loc = useLocation();

  // ⏳ בזמן טעינת user מה-localStorage
  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;

  // ❌ אם אין משתמש → הולכים להתחברות אדמין
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: loc }} />;
  }

  // ❌ אם התפקיד לא מתאים
  if (!allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ✔ עבר בדיקות — מציג את הרכיבים הפנימיים
  return <Outlet />;
}

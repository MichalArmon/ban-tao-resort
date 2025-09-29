// routes.jsx
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth"; // { user, role: 'guest'|'admin' }
import App from "./App";
import PublicLayout from "./pages/public/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminHome from "./pages/admin/AdminHome";
import GuestLayout from "./pages/guest/GuestLayout";
import Booking from "./pages/guest/Booking";
import Reservations from "./pages/guest/Reservations";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import { useEffect } from "react";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
SignUp;

function RequireAuth({ allow, fallback = "/enter" }) {
  const { user, role, loginGuest } = useAuth();
  const loc = useLocation();

  // בייפס רק בדוולופמנט – מבצע אוטו־לוגין כאורחת
  useEffect(() => {
    if (import.meta.env.DEV && !user) {
      loginGuest?.({ name: "Guest (DEV)" });
    }
  }, [user, loginGuest]);

  // בזמן האוטו־לוגין – הציגי משהו מינימלי במקום null
  if (import.meta.env.DEV && !user)
    return <div style={{ padding: 16 }}>Loading…</div>;

  if (!user) return <Navigate to={fallback} replace state={{ from: loc }} />;
  return allow.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* אתר תדמית / ציבורי (כולל עמוד משקיעים שיווקי) */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />

        {/* תדמיתי בלבד */}
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        {/* שער גישה לאורחים (במקום "login") */}
      </Route>

      {/* אזור אורחים מוגן (לוגין חובה) */}

      <Route path="/guest" element={<GuestLayout />}>
        {/* <Route index element={<GuestHome />} /> */}
        <Route path="booking" element={<Booking />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} /> {/* << כאן הוספנו */}
        {/* <Route path="content" element={<ExclusiveContent />} /> */}
        {/* <Route path="profile" element={<Profile />} /> */}
      </Route>

      {/* אדמין: לוגין + אזור מוגן */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        element={<RequireAuth allow={["admin"]} fallback="/admin/login" />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          {/* <Route path="rooms" element={<RoomsCRUD />} />
            <Route path="media" element={<GalleryCRUD />} />
            <Route path="rates" element={<RatesCRUD />} />
            <Route path="reports" element={<AdminReports />} /> */}
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

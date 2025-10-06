// routes.jsx
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "./auth";

// 🌴 Resort imports
import PublicLayout from "./pages/public/PublicLayout";
import Home from "./pages/public/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GuestLayout from "./pages/guest/GuestLayout";
import Booking from "./pages/guest/Booking";
import Reservations from "./pages/guest/Reservations";
import AvailabilityPage from "./components/booking/AvailabilityPage";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

// 🧱 Studio imports
import StudioLayout from "./pages/studio/StudioLayout";
import StudioHome from "./pages/studio/StudioHome";
import StudioAbout from "./pages/studio/StudioAbout";

// ⚙️ Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";

// ❌ Not Found
import NotFound from "./pages/NotFound";

// --------------------------------------------------------

function RequireAuth({ allow, fallback = "/enter" }) {
  const { user, role, loginGuest } = useAuth();
  const loc = useLocation();

  // Auto-login כ"אורחת" רק בדבלופמנט
  useEffect(() => {
    if (import.meta.env.DEV && !user) {
      loginGuest?.({ name: "Guest (DEV)" });
    }
  }, [user, loginGuest]);

  if (import.meta.env.DEV && !user)
    return <div style={{ padding: 16 }}>Loading…</div>;

  if (!user) return <Navigate to={fallback} replace state={{ from: loc }} />;
  return allow.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
}

// --------------------------------------------------------

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect זמני מהשורש */}
      <Route path="/" element={<Navigate to="/resort" replace />} />

      {/* ========================== */}
      {/* 🌴 RESORT SECTION */}
      {/* ========================== */}
      <Route path="/resort" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* אזור אורחים מוגן (Guest Area) */}
      <Route path="/resort/guest" element={<GuestLayout />}>
        <Route index element={<AvailabilityPage />} />
        <Route path="booking" element={<Booking />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* ========================== */}
      {/* 🧱 STUDIO SECTION */}
      {/* ========================== */}
      <Route path="/studio" element={<StudioLayout />}>
        <Route index element={<StudioHome />} />
        <Route path="about" element={<StudioAbout />} />
        {/* בעתיד: <Route path="portfolio" element={<Portfolio />} /> */}
      </Route>

      {/* ========================== */}
      {/* ⚙️ ADMIN SECTION */}
      {/* ========================== */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        element={<RequireAuth allow={["admin"]} fallback="/admin/login" />}
      >
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          {/* בעתיד: rooms, media, rates, reports וכו' */}
        </Route>
      </Route>

      {/* ========================== */}
      {/* ❌ 404 fallback */}
      {/* ========================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

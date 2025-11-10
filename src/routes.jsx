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
// import StudioAbout from "./pages/studio/StudioAbout";

// ⚙️ Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";

// ❌ Not Found
import NotFound from "./pages/NotFound";

// Retreats / Rooms
import RetreatAll from "./pages/reatrets/RetreatAll"; // אם התיקייה באמת "reatrets" השאירי כך
import Room from "./pages/rooms/Room";

import AdminTest from "./pages/admin/AdminTest";
import RoomsAll from "./pages/rooms/RoomsAll";
import RetreatsLanding from "./pages/guest/RetreatsLanding";
import ClassesLanding from "./pages/guest/woreshops/ClassesLanding";
import TreatmentsLanding from "./pages/guest/TreatmentsLanding";
import BookingCheckout from "./components/booking/BookingCheckout";

import RetreatPage from "./pages/reatrets/RetreatPage";
import AdminRetreats from "./pages/admin/RetreatForm";
import AdminRetreatForm from "./pages/admin/retreats/AdminRetreatForm";
import AdminRecurringRules from "./pages/admin/recurring/AdminRecurringRules";
import AdminTreatments from "./pages/admin/treatments/AdminTreatments";
import AdminWorkshops from "./pages/admin/workshops/AdminWorkshops";
import WorkshopForm from "./pages/admin/workshops/WorkshopForm";
import TreatmentForm from "./pages/admin/treatments/TreatmentForm";
import AdminCategories from "./pages/admin/categories/AdminCategories";
import AdminRooms from "./pages/admin/rooms/AdminRooms";
import RoomForm from "./pages/admin/rooms/RoomForm";
import AdminBookings from "./pages/admin/bookings/AdminBookings";
import GuestHome from "./pages/guest/GuestHome";

function RequireAuth({ allow, fallback = "/enter" }) {
  const { user, role, loginGuest } = useAuth();
  const loc = useLocation();

  // Auto-login כ"אורחת" רק בדבלופמנט
  useEffect(() => {
    if (import.meta.env.DEV && !user) {
      loginGuest?.({ name: "Guest (DEV)" });
    }
  }, [user, loginGuest]);

  if (import.meta.env.DEV && !user) {
    return <div style={{ padding: 16 }}>Loading…</div>;
  }

  if (!user) return <Navigate to={fallback} replace state={{ from: loc }} />;
  return allow.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect מהשורש ל-/resort */}
      <Route path="/" element={<Navigate to="/resort" replace />} />

      {/* ========================== */}
      {/* 🌴 RESORT SECTION */}
      {/* ========================== */}
      <Route path="/resort" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* אזור אורחים (Guest Area) */}
      <Route path="/resort/guest" element={<GuestLayout />}>
        <Route index element={<GuestHome />} />
        <Route path="booking" element={<Booking />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
        <Route path="retreats" element={<RetreatsLanding />} />
        <Route path="retreats/:slug" element={<RetreatPage />} />
        <Route path="workshops" element={<ClassesLanding />} />
        <Route path="treatments" element={<TreatmentsLanding />} />
        <Route path="rooms" element={<RoomsAll />} />
        <Route path="checkout" element={<BookingCheckout />} />
        <Route
          path="rooms"
          element={<Navigate to="/resort/guest/rooms/bungalow" replace />}
        />
        <Route path="rooms/:type" element={<Room />} />
      </Route>

      {/* ========================== */}
      {/* 🧱 STUDIO SECTION */}
      {/* ========================== */}
      <Route path="/studio" element={<StudioLayout />}>
        <Route index element={<StudioHome />} />
        {/* <Route path="about" element={<StudioAbout />} /> */}
      </Route>

      {/* ========================== */}
      {/* ⚙️ ADMIN SECTION */}
      {/* ========================== */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="rooms" element={<AdminRooms />} />
        <Route path="my-booking" element={<AdminBookings />} />
        <Route path="rooms/new" element={<RoomForm />} />
        <Route path="rooms/edit/:id" element={<RoomForm />} />
        <Route path="retreats" element={<AdminRetreats />} />
        <Route path="retreats/new" element={<AdminRetreatForm />} />
        <Route path="retreats/edit/:id" element={<AdminRetreatForm />} />
        <Route path="workshops" element={<AdminWorkshops />} />
        <Route path="workshops/new" element={<WorkshopForm />} />
        <Route path="workshops/edit/:id" element={<WorkshopForm />} />
        <Route path="workshops/schedule" element={<AdminRecurringRules />} />
        <Route path="treatments" element={<AdminTreatments />} />
        <Route path="treatments/new" element={<TreatmentForm />} />
        <Route path="treatments/edit/:id" element={<TreatmentForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="recurring" element={<AdminRecurringRules />} />

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* ========================== */}
      {/* ❌ 404 */}
      {/* ========================== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

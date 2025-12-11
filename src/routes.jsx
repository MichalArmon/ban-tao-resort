// routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// 🌴 Resort imports
import PublicLayout from "./pages/public/PublicLayout";
import Home from "./pages/public/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GuestLayout from "./pages/guest/GuestLayout";
import Booking from "./pages/guest/Booking";
import Reservations from "./pages/guest/Reservations";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import RoomsAll from "./pages/rooms/RoomsAll";
import RetreatsLanding from "./pages/guest/RetreatsLanding";
import ClassesLanding from "./pages/guest/woreshops/ClassesLanding";
import TreatmentsLanding from "./pages/guest/TreatmentsLanding";
import Room from "./pages/rooms/Room";
import BookingCheckout from "./components/booking/BookingCheckout";
import GuestHome from "./pages/guest/GuestHome";
import ThankYouPage from "./pages/guest/ThankYouPage";
import FavoritesPage from "./pages/guest/FavoritesPage";

// Studio
import StudioLayout from "./pages/studio/StudioLayout";
import StudioHome from "./pages/studio/StudioHome";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminRooms from "./pages/admin/rooms/AdminRooms";
import RoomForm from "./pages/admin/rooms/RoomForm";
import AdminRetreats from "./pages/admin/RetreatForm";
import AdminRetreatForm from "./pages/admin/retreats/AdminRetreatForm";
import AdminWorkshops from "./pages/admin/workshops/AdminWorkshops";
import WorkshopForm from "./pages/admin/workshops/WorkshopForm";
import AdminTreatments from "./pages/admin/treatments/AdminTreatments";
import TreatmentForm from "./pages/admin/treatments/TreatmentForm";
import AdminCategories from "./pages/admin/categories/AdminCategories";
import AdminRecurringRules from "./pages/admin/recurring/AdminRecurringRules";
import AdminBookings from "./pages/admin/bookings/AdminBookings";

// Not found
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/auth/RequireAuth";
import UserForm from "./pages/admin/users/UserForm";
import AdminUsers from "./pages/admin/users/AdminUsers";

// RequireAuth (החדש!)

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root → resort */}
      <Route path="/" element={<Navigate to="/resort" replace />} />

      {/* PUBLIC / RESORT */}
      <Route path="/resort" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* GUEST AREA */}
      <Route path="/resort/guest" element={<GuestLayout />}>
        <Route index element={<GuestHome />} />
        <Route path="booking" element={<Booking />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="reservations" element={<Reservations />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
        <Route path="rooms" element={<RoomsAll />} />
        <Route path="rooms/:type" element={<Room />} />
        <Route path="retreats" element={<RetreatsLanding />} />
        <Route path="workshops" element={<ClassesLanding />} />
        <Route path="treatments" element={<TreatmentsLanding />} />
        <Route path="checkout" element={<BookingCheckout />} />
        <Route path="thank-you" element={<ThankYouPage />} />
      </Route>

      {/* STUDIO */}
      <Route path="/studio" element={<StudioLayout />}>
        <Route index element={<StudioHome />} />
      </Route>

      {/* ADMIN LOGIN PAGE */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ADMIN PROTECTED AREA */}
      <Route path="/admin" element={<RequireAuth allow={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="rooms" element={<AdminRooms />} />
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
          <Route path="my-booking" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/edit/:id" element={<UserForm />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

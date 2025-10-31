// 📁 src/context/BookingContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { GLOBAL_API_BASE } from "../config/api";

const BookingContext = createContext();

// ===== API base =====
const API_BASE_URL = `${GLOBAL_API_BASE}/bookings`;
const AVAILABILITY_URL = `${API_BASE_URL}/availability`;
const QUOTE_URL = `${API_BASE_URL}/quote`; // v2 controller
const QUOTE_FALLBACK_URL = `${API_BASE_URL}/get-quote`; // backward compat
const CREATE_URL = `${API_BASE_URL}`; // POST /bookings  (זה הקיים בראוטר שלך)

// Hook
export const useBooking = () => useContext(BookingContext);

/* ---------- Helpers ---------- */
const pad2 = (n) => String(n).padStart(2, "0");
const formatDate = (dateObj) => {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const getTodayDate = () => formatDate(new Date());
const getTomorrowDate = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatDate(t);
};
const diffNights = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
};

/* =================================================================== */
/*                           Booking Provider                          */
/* =================================================================== */
export const BookingProvider = ({ children }) => {
  /* ---------- Dates ---------- */
  const [checkIn, setCheckIn] = useState(getTodayDate());
  const [checkOut, setCheckOut] = useState(getTomorrowDate());

  /* ---------- Availability ---------- */
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  /* ---------- Guests / Rooms ---------- */
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);

  /* ---------- Selection + Quote ---------- */
  const [selectedRoomId, setSelectedRoomId] = useState(null); // roomType _id/slug
  const [finalQuote, setFinalQuote] = useState(null); // { totalPrice, currency, isRetreatPrice, breakdown? }
  const [currency, setCurrency] = useState("USD");

  /* ---------- Customer (BOOK form) ---------- */
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const nights = diffNights(checkIn, checkOut);

  /* =================================================================== */
  /*                         Availability (rooms)                         */
  /* =================================================================== */
  const fetchAvailability = useCallback(
    async (roomType) => {
      if (!checkIn || !checkOut || guests < 1 || rooms < 1) {
        setError("Please select valid dates, guests, and rooms.");
        return;
      }

      setLoading(true);
      setError(null);
      setMessage("");
      setAvailableRooms([]);

      try {
        const params = new URLSearchParams({
          checkIn,
          checkOut,
          guests: String(guests),
          rooms: String(rooms),
        });
        if (roomType) params.append("roomType", roomType);

        const url = `${AVAILABILITY_URL}?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok)
          throw new Error(data?.message || "Failed to fetch availability.");

        setAvailableRooms(
          Array.isArray(data.availableRooms) ? data.availableRooms : []
        );
        setMessage(data?.message || "");
        if (data?.currency) setCurrency(data.currency);
      } catch (err) {
        console.error("Availability check failed:", err);
        setError(
          err?.message || "An unexpected error occurred. Please try again."
        );
        setAvailableRooms([]);
      } finally {
        setLoading(false);
      }
    },
    [checkIn, checkOut, guests, rooms]
  );

  /* =================================================================== */
  /*                               Quote                                 */
  /* =================================================================== */
  const fetchQuote = useCallback(
    async ({ roomType, retreatId, currentCheckIn, currentCheckOut } = {}) => {
      const payload = {
        checkIn: currentCheckIn ?? checkIn,
        checkOut: currentCheckOut ?? checkOut,
        guests,
        rooms,
        roomType: roomType ?? selectedRoomId ?? null,
        retreatId: retreatId ?? null,
      };

      const tryPost = async (url) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || `Quote failed (${res.status})`);
        return data;
      };

      try {
        const data = await tryPost(QUOTE_URL).catch(async (e) => {
          if (String(e?.message || "").includes("404")) {
            return await tryPost(QUOTE_FALLBACK_URL);
          }
          throw e;
        });

        setFinalQuote(data);
        if (data?.currency) setCurrency(data.currency);
        return data;
      } catch (err) {
        console.error("fetchQuote failed:", err);
        setError(err?.message || "Failed to get quote.");
        setFinalQuote(null);
        throw err;
      }
    },
    [checkIn, checkOut, guests, rooms, selectedRoomId]
  );

  /* =================================================================== */
  /*                           Create Booking                             */
  /* =================================================================== */
  // Rooms/Retreats flow (roomType/retreatId) — אם את משתמשת בו בפרונט
  const createBooking = useCallback(
    async ({ roomType, retreatId } = {}) => {
      setLoading(true);
      setError(null);

      const payload = {
        checkIn,
        checkOut,
        guests,
        rooms,
        roomType: roomType ?? selectedRoomId ?? null,
        retreatId: retreatId ?? null,
        customer,
        quote: finalQuote ?? undefined,
      };

      try {
        const res = await fetch(CREATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.message || "Failed to create booking.");

        if (data?.currency) setCurrency(data.currency);
        return data;
      } catch (err) {
        console.error("createBooking failed:", err);
        setError(err?.message || "Failed to create booking.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [checkIn, checkOut, guests, rooms, selectedRoomId, customer, finalQuote]
  );

  /* =================================================================== */
  /*               Create booking for workshops / treatments             */
  /* =================================================================== */
  // שולח ל-POST /api/v1/bookings בדיוק לפי הקונטרולר שלך
  const createSimpleBooking = useCallback(
    async ({ type, itemId, sessionId, date }) => {
      setLoading(true);
      setError(null);

      // ✅ ולידציות מוקדמות (כמו שביקשת, אך משאירים הודעות ברורות)
      if (!type) {
        setLoading(false);
        throw new Error("Missing booking type.");
      }
      if (!itemId) {
        setLoading(false);
        throw new Error("Missing itemId.");
      }
      if (type === "workshop" && !sessionId) {
        setLoading(false);
        throw new Error("Missing sessionId for workshop.");
      }
      if (type === "treatment" && !date) {
        setLoading(false);
        throw new Error("Missing date for treatment.");
      }

      const payload = {
        type, // "room" | "treatment" | "workshop" | "retreat"
        itemId,
        ...(type === "workshop" && { sessionId }),
        ...(type === "treatment" && { date }), // "YYYY-MM-DDTHH:mm"
        ...(type === "room" && {
          // אם תשתמשי בזה גם לחדרים
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }),
        guestInfo: {
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          notes: customer.notes,
        },
      };

      // 🟡 לוג דיבוג (מומלץ להשאיר בזמן פיתוח)
      // console.log("[createSimpleBooking] POST", CREATE_URL, payload);

      try {
        const res = await fetch(CREATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // קוראים raw כדי לתפוס הודעות לא-JSON
        const raw = await res.text();
        let data = {};
        try {
          data = raw ? JSON.parse(raw) : {};
        } catch {
          /* ignore non-JSON */
        }

        if (!res.ok) {
          const msg =
            data?.message ||
            data?.error ||
            raw ||
            `Failed to create booking (HTTP ${res.status})`;
          throw new Error(msg);
        }

        if (data?.currency) setCurrency(data.currency);
        return data;
      } catch (err) {
        console.error("createSimpleBooking failed:", err);
        setError(err?.message || "Failed to create booking.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [checkIn, checkOut, customer]
  );

  /* =================================================================== */
  /*                        Retreats calendar (UI)                        */
  /* =================================================================== */
  const fetchMonthlyRetreatsMap = useCallback(async (year, month) => {
    try {
      const url = `${GLOBAL_API_BASE}/retreats/monthly-map?year=${year}&month=${month}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed retreats map (${res.status})`);
      const data = await res.json();
      return data?.days || {};
    } catch (e) {
      console.error("Retreats map fetch failed:", e);
      return {};
    }
  }, []);

  const fetchRetreatsCalendar = useCallback(
    async (monthsAhead = 24) => {
      const merged = { days: {} };
      try {
        const now = new Date();
        for (let i = 0; i < monthsAhead; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
          const y = d.getFullYear();
          const m = d.getMonth() + 1;

          const monthDays = await fetchMonthlyRetreatsMap(y, m);
          for (const [iso, items] of Object.entries(monthDays)) {
            if (!merged.days[iso]) merged.days[iso] = [];
            merged.days[iso].push(...items);
          }
        }
      } catch (e) {
        console.error("fetchRetreatsCalendar failed:", e);
      }
      return merged;
    },
    [fetchMonthlyRetreatsMap]
  );

  /* =================================================================== */
  /*                                Value                                */
  /* =================================================================== */
  const value = {
    // Calendar (retreats)
    fetchRetreatsCalendar,
    fetchMonthlyRetreatsMap,

    // Dates
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    nights,

    // Availability state
    availableRooms,
    loading,
    error,
    message,

    // Guests / Rooms
    guests,
    setGuests,
    rooms,
    setRooms,

    // Selection / Quote / Currency
    selectedRoomId,
    setSelectedRoomId,
    finalQuote,
    setFinalQuote,
    currency,

    // Customer (BOOK form)
    customer,
    setCustomer,

    // Functions
    fetchAvailability,
    fetchQuote,
    createBooking, // rooms/retreats (אם בשימוש)
    createSimpleBooking, // workshops/treatments (וגם room אם תרצי)
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

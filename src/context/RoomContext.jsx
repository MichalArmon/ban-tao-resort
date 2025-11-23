import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { get } from "../config/api";
import { useDateSelection } from "./DateSelectionContext";

const RoomsContext = createContext(null);

export const RoomsProvider = ({ children }) => {
  // 🆕 צריכת הסטייט והסטאטרים מהקונטקסט המרכזי
  const {
    checkIn,
    checkOut,
    guests,
    roomsCount,
    setGuests,
    setRoomsCount,
    setCheckIn,
    setCheckOut,
  } = useDateSelection();

  const [rooms, setRooms] = useState([]); // 👈 רשימת החדרים המלאה שנטענה מראש
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  const [selectedRoom, setSelectedRoom] =
    useState(
      null
    ); /* ============================================================
    🟢 זמינות חדרים
    ============================================================ */

  const [availableRooms, setAvailableRooms] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] =
    useState(
      null
    ); /* ============================================================
    🔁 רענון רשימת חדרים (Refresh)
    ============================================================ */

  const refreshRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      const list = await get("/rooms");
      setRooms(list || []);
    } catch (err) {
      console.error("❌ Failed to load rooms:", err);
      setRoomsError(err);
    } finally {
      setLoadingRooms(false);
    }
  }, []); /* ============================================================
    ⚡ טוען את כל החדרים (פעם אחת)
    ============================================================ */

  const ensureRooms = useCallback(async () => {
    if (rooms.length > 0) return;
    await refreshRooms();
  }, [
    rooms,
    refreshRooms,
  ]); /* ============================================================
    🔍 שליפת חדר לפי ID (Admin)
    ============================================================ */

  const getRoomById = useCallback(async (id) => {
    if (!id) return null;
    try {
      const room = await get(`/rooms/${id}`);
      setSelectedRoom(room);
      return room;
    } catch (err) {
      console.error("❌ Failed to load room by ID:", err);
      throw err;
    }
  }, []); /* ============================================================
    🔍 שליפת חדר לפי slug (Guests)
    ============================================================ */ // פונקציה זו כבר לא רלוונטית כשיש לנו את רשימת החדרים המלאה (rooms) ב-state

  const getRoomBySlug = useCallback(
    async (slug) => {
      if (!slug) return null; // 💡 שימוש ברשימה הקיימת במקום קריאת API חדשה
      const room = rooms.find((r) => r.slug === slug);
      if (room) return room;

      try {
        const apiRoom = await get(`/rooms/slug/${slug}`);
        return apiRoom;
      } catch (err) {
        console.error("❌ Failed to load room by slug:", err);
        throw err;
      }
    },
    [rooms]
  ); /* ============================================================ // 👈 הוספת rooms ל-dependencies
    🔍 בדיקת זמינות חדרים (התיקון המרכזי)
    ============================================================ */

  const checkRoomAvailability = useCallback(
    async ({ roomSlug = "any", checkIn: ci, checkOut: co }) => {
      const effectiveCheckIn = ci || checkIn;
      const effectiveCheckOut = co || checkOut;

      if (!effectiveCheckIn || !effectiveCheckOut) return null;

      try {
        setAvailabilityLoading(true);
        setAvailabilityError(null); // --------------------------------------------------- // 1) בקשה לזמינות – מחזירה נתונים חלקיים (priceBase, availableUnits) // ---------------------------------------------------

        const url = `/rooms/availability?checkIn=${effectiveCheckIn}&checkOut=${effectiveCheckOut}&guests=${guests}&rooms=${roomsCount}`;
        const data = await get(url);

        const raw = Array.isArray(data?.availableRooms)
          ? data.availableRooms
          : []; // --------------------------------------------------- // 2) סינון חדר ספציפי (אם נבחר) // ---------------------------------------------------

        let filtered = raw;

        if (roomSlug !== "any") {
          filtered = raw.filter((r) => r.slug === roomSlug);
        }

        if (filtered.length === 0) {
          setAvailableRooms([]);
          return [];
        } // --------------------------------------------------- // 3) 🟢 התיקון: איחוד נתונים מ-rooms שנטען מראש (ללא קריאת API נוספת) // ---------------------------------------------------

        const finalList = filtered
          .map((item) => {
            // מצא את החדר המלא ברשימה הכללית לפי slug
            const fullRoomDetails = rooms.find((r) => r.slug === item.slug);

            if (!fullRoomDetails) {
              console.warn(
                `Room details not found in cache for slug: ${item.slug}`
              );
              return null; // מדלג על חדרים שלא נמצאו
            } // שלב את נתוני החדר המלאים עם נתוני הזמינות

            return {
              ...fullRoomDetails, // 👈 מכיל title, heroUrl, maxGuests, sizeM2
              availableUnits: item.availableUnits,
              priceBase:
                item.priceBase != null
                  ? item.priceBase
                  : fullRoomDetails.priceBase,
              currency: item.currency || fullRoomDetails.currency,
            };
          })
          .filter(Boolean); // הסרת תוצאות null (אם חדר לא נמצא ב-rooms)

        setAvailableRooms(finalList);
        return finalList;
      } catch (err) {
        console.error("❌ Availability error:", err);
        setAvailabilityError(err?.message || "Failed to check availability");
        setAvailableRooms([]);
        return null;
      } finally {
        setAvailabilityLoading(false);
      }
    }, // ⚠️ חובה להוסיף את 'rooms' כ-dependency כי אנו משתמשים בו בפנים
    [checkIn, checkOut, guests, roomsCount, rooms]
  );

  const value = {
    /* Data */ rooms,
    loadingRooms,
    roomsError,
    selectedRoom /* Fetchers */,

    ensureRooms,
    refreshRooms,
    getRoomById,
    getRoomBySlug /* Availability */,

    availableRooms,
    availabilityLoading,
    availabilityError,
    checkRoomAvailability,
    setAvailableRooms, // נתונים נצרכים מה-DateSelectionContext:

    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    roomsCount,
    setRoomsCount,
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);

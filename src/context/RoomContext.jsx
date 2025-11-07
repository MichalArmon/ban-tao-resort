// 📁 src/context/RoomsContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { get } from "../config/api";

const RoomsContext = createContext(null);

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  /* ============================================================
     ⚡ טוען את כל החדרים (פעם אחת)
     ============================================================ */
  const ensureRooms = useCallback(async () => {
    if (rooms.length > 0) return; // כבר נטען
    await refreshRooms();
  }, [rooms]);

  /* ============================================================
     🔁 רענון ידני של רשימת החדרים
     ============================================================ */
  const refreshRooms = useCallback(async () => {
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      // ✅ תואם לנתיב החדש שלך: GET /api/v1/rooms
      const list = await get("/rooms");
      setRooms(list || []);
    } catch (err) {
      console.error("❌ Failed to load rooms:", err);
      setRoomsError(err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  /* ============================================================
     🔍 שליפת חדר לפי ID (לעריכת אדמין)
     ============================================================ */
  const getRoomById = useCallback(async (id) => {
    if (!id) return null;
    try {
      // ✅ תואם לנתיב החדש: GET /api/v1/rooms/:id
      const room = await get(`/rooms/${id}`);
      setSelectedRoom(room);
      return room;
    } catch (err) {
      console.error("❌ Failed to load room by ID:", err);
      throw err;
    }
  }, []);

  /* ============================================================
     🔍 שליפת חדר לפי slug (לאורחים)
     ============================================================ */
  const getRoomBySlug = useCallback(async (slug) => {
    if (!slug) return null;
    try {
      // ✅ תואם לנתיב החדש: GET /api/v1/rooms/slug/:slug
      const room = await get(`/rooms/slug/${slug}`);
      return room;
    } catch (err) {
      console.error("❌ Failed to load room by slug:", err);
      throw err;
    }
  }, []);

  const value = {
    rooms,
    loadingRooms,
    roomsError,
    ensureRooms,
    refreshRooms,
    selectedRoom,
    setSelectedRoom,
    getRoomById,
    getRoomBySlug,
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};

export const useRooms = () => useContext(RoomsContext);

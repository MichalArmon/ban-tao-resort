import React, { createContext, useContext, useState, useCallback } from "react";
import { get } from "../config/api";
import moment from "moment";
import { useDateSelection } from "./DateSelectionContext";

const SessionsCtx = createContext(null);

/* ============================================================
    Provider
   ============================================================ */
export function SessionsProvider({ children }) {
  const { checkIn, checkOut, selectedSessionDate, setSelectedSessionDate } =
    useDateSelection();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionGuests, setSessionGuests] = useState(1);

  /* ============================================================
      🔍 זמינות לסשן בודד
     ============================================================ */
  const getSessionAvailability = useCallback(async (sessionId) => {
    try {
      if (!sessionId) return null;

      const url = `/sessions/${sessionId}/availability`;
      console.log("🔎 Checking session availability:", url);

      const data = await get(url);
      return data;
    } catch (err) {
      console.error("❌ getSessionAvailability failed:", err);
      return null;
    }
  }, []);

  /* ============================================================
      🧩 Batch availability
     ============================================================ */
  const loadAvailabilityForSessions = useCallback(
    async (sessionsArray) => {
      if (!Array.isArray(sessionsArray) || sessionsArray.length === 0)
        return sessionsArray;

      const results = await Promise.all(
        sessionsArray.map(async (s) => {
          const availability = await getSessionAvailability(s._id);
          return {
            ...s,
            availability,
          };
        })
      );
      return results;
    },
    [getSessionAvailability]
  );

  /* ============================================================
      טעינת סשנים (Weekly / Workshop / Studio)
     ============================================================ */
  const loadSessions = useCallback(async ({ from, to, workshopId, studio }) => {
    try {
      const key = `${workshopId || "all"}_${moment(from).format(
        "YYYY-MM-DD"
      )}_${moment(to).format("YYYY-MM-DD")}_${studio || "any"}`;

      if (window.__lastSessionsKey === key) {
        console.log("⏸️ Skipping duplicate session fetch:", key);
        return;
      }
      window.__lastSessionsKey = key;

      setLoading(true);
      setError(null);

      const fromStr = moment(from).format("YYYY-MM-DD");
      const toStr = moment(to).format("YYYY-MM-DD");

      let url = `/sessions?start=${fromStr}&end=${toStr}`;
      if (workshopId) url += `&workshopId=${workshopId}`;
      if (studio) url += `&studio=${studio}`;

      console.log("🌐 Fetching sessions:", url);
      const res = await get(url);

      let normalized = (res || []).map((s) => ({
        ...s,
        startLocal: s.start ? moment.utc(s.start).local().toDate() : null,
        endLocal: s.end ? moment.utc(s.end).local().toDate() : null,

        // 🟢 תיקון יחיד — availability נכון
        availability: {
          capacity: s.capacity,
          booked: s.bookedCount, // ← ← ← תיקון כאן
          remaining: s.remaining,
          status: s.status,
        },
      }));

      console.log("✅ Sessions loaded with FINAL availability:", normalized);

      setSessions(normalized);
    } catch (e) {
      console.error("❌ Failed to load sessions:", e);
      setError(e.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SessionsCtx.Provider
      value={{
        sessions,
        loading,
        error,

        loadSessions,

        getSessionAvailability,
        loadAvailabilityForSessions,

        selectedDate: selectedSessionDate,
        setSelectedDate: setSelectedSessionDate,

        selectedSession,
        setSelectedSession,
        sessionGuests,
        setSessionGuests,

        generalCheckIn: checkIn,
        generalCheckOut: checkOut,
      }}
    >
      {children}
    </SessionsCtx.Provider>
  );
}

/* ============================================================
    Hook
   ============================================================ */
export function useSessions() {
  const ctx = useContext(SessionsCtx);
  if (!ctx)
    throw new Error("useSessions must be used within a SessionsProvider");
  return ctx;
}

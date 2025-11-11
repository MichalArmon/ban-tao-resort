// 📁 src/context/SessionsContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { get } from "../config/api";
import moment from "moment";

const SessionsCtx = createContext(null);

/* ============================================================
   Provider
   ============================================================ */
export function SessionsProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ============================================================
     טעינת סשנים לפי טווח תאריכים / חוג / סטודיו
     ============================================================ */
  const loadSessions = useCallback(async ({ from, to, workshopId, studio }) => {
    try {
      // ✅ מניעת קריאות כפולות
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

      let url = `/sessions?from=${fromStr}&to=${toStr}`;
      if (workshopId) url += `&workshopId=${workshopId}`;
      if (studio) url += `&studio=${studio}`;

      console.log("🌐 Fetching sessions:", url);

      const res = await get(url);
      console.log("📦 Response from server:", res);
      console.log("🕐 First session start:", res?.[0]?.start);

      // 🟢 נורמליזציה: המרה מ-UTC לזמן מקומי (ישראל)
      const normalized = (res || []).map((s) => ({
        ...s,
        startLocal: s.start ? moment.utc(s.start).local().toDate() : null,
        endLocal: s.end ? moment.utc(s.end).local().toDate() : null,
      }));

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

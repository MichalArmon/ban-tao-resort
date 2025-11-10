import React, { createContext, useContext, useState, useCallback } from "react";
import { get } from "../config/api";
import moment from "moment-timezone";

const SessionsCtx = createContext(null);
const TZ = "Asia/Bangkok";

/* ============================================================
    Provider
    ============================================================ */
export function SessionsProvider({ children }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState(
      null
    ); /* ============================================================
      טעינת סשנים לפי טווח תאריכים / חוג / סטודיו
  ============================================================ */

  const loadSessions = useCallback(async ({ from, to, workshopId, studio }) => {
    try {
      // ✅ מפתח ייחודי למניעת לולאות
      const key = `${workshopId || "all"}_${moment(from).format(
        "YYYY-MM-DD"
      )}_${moment(to).format("YYYY-MM-DD")}_${studio || "any"}`;
      if (window.__lastSessionsKey === key) {
        console.log("⏸️ Skipping duplicate session fetch:", key);
        return;
      }
      window.__lastSessionsKey = key;

      setLoading(true);
      setError(null); // המרה לפורמט תקין

      const fromStr = moment(from).format("YYYY-MM-DD");
      const toStr = moment(to).format("YYYY-MM-DD"); // 🟢 תיקון ה-URL: שינוי מ- /schedule ל- /sessions

      let url = `/sessions?from=${fromStr}&to=${toStr}`;
      if (workshopId) url += `&workshopId=${workshopId}`;
      if (studio) url += `&studio=${studio}`;

      console.log("🌐 Fetching sessions:", url);

      const res = await get(url);
      console.log("✅ Sessions response:", res); // 🎯 התיקון הסופי (להצגת שעה נכונה ב-Frontend): // חותכים את המחרוזת ומפרשים אותה כזמן ב-Asia/Bangkok (TZ).

      const normalized = (res || []).map((s) => ({
        ...s,
        startLocal: moment
          .tz(s.start.substring(0, 19), TZ)
          .format("YYYY-MM-DD HH:mm"),
        endLocal: moment
          .tz(s.end.substring(0, 19), TZ)
          .format("YYYY-MM-DD HH:mm"),
        tz: TZ,
      }));

      setSessions(normalized);
    } catch (e) {
      console.error("❌ Failed to load sessions:", e);
      setError(e.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []); // ⚡ חשוב! ריק => יציב לעד

  return (
    <SessionsCtx.Provider
      value={{
        sessions,
        loading,
        error,
        loadSessions,
      }}
    >
            {children}   {" "}
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

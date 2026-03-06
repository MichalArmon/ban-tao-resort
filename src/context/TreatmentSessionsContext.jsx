import React, { createContext, useContext, useState, useEffect } from "react";

import "moment/locale/he";
import { get, post } from "../config/api";
import { useUser } from "./UserContext";
import moment from "moment-timezone";

const TreatmentSessionsContext = createContext();
export const useTreatmentSessions = () => useContext(TreatmentSessionsContext);
moment.tz.setDefault("Asia/Bangkok");
// moment.locale("he");

const START_HOUR = 9;
const END_HOUR = 17;

/* ----------------------------------------------------
   ⏱ בניית שבוע שלם עם moment
---------------------------------------------------- */
function buildWeekRange(startDate) {
  const start = moment(startDate).startOf("week").add(1, "day"); // Monday
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(moment(start).add(i, "day"));
  }
  return days;
}

export function TreatmentSessionsProvider({ children }) {
  const { user } = useUser();

  const [sessions, setSessions] = useState([]);
  const [weekStart, setWeekStart] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(null);

  const [treatmentId, setTreatmentId] = useState(null);

  const weekDays = buildWeekRange(weekStart);
  const from = weekDays[0].format("YYYY-MM-DD");
  const to = weekDays[6].format("YYYY-MM-DD");

  /* ----------------------------------------------------
     🟢 טעינת סשנים לטיפול ספציפי
  ---------------------------------------------------- */
  const loadSessions = async (id) => {
    if (!id) return;
    setTreatmentId(id);

    try {
      setLoading(true);
      const res = await get(`/treatments/${id}/sessions?from=${from}&to=${to}`);
      const arr = res.data?.sessions || res.data || res;
      console.log("RAW SESSIONS:", arr);
      setSessions(arr);
      console.log("SESSION SAMPLE:", arr[0]);
    } catch (err) {
      console.error("Failed to load treatment schedule", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
     🟢 טעינה מחדש כאשר משתנה שבוע או טיפול
  ---------------------------------------------------- */
  useEffect(() => {
    if (treatmentId) loadSessions(treatmentId);
  }, [treatmentId, from, to]);

  /* ----------------------------------------------------
     🟢 בוקינג לסשן
  ---------------------------------------------------- */
  const bookSession = async (sessionId) => {
    try {
      setBookingLoading(sessionId);
      await post(`/treatments/sessions/${sessionId}/book`, {});
      await loadSessions(treatmentId);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("לא ניתן להזמין את הסשן.");
    } finally {
      setBookingLoading(null);
    }
  };

  /* ----------------------------------------------------
     🟢 יצירת sessionMap לפי תאריך+שעה
        ❗ שימוש ב־moment.utc כדי למנוע הזזת שעות
  ---------------------------------------------------- */
  const sessionMap = {};
  sessions.forEach((s) => {
    // ⚠️ חובה לפרש כ-UTC ואז להמיר לאזור זמן מקומי
    const d = moment.utc(s.start).tz("Asia/Bangkok");

    const key = `${d.format("YYYY-MM-DD")}-${d.hour()}`;
    sessionMap[key] = {
      ...s,
      startLocal: d.toDate(), // 👈 אופציונלי אבל מאוד מומלץ ל-UI
    };
  });

  console.log("SESSION MAP:", sessionMap);

  return (
    <TreatmentSessionsContext.Provider
      value={{
        sessions,
        weekStart,
        loading,
        bookingLoading,
        weekDays,
        START_HOUR,
        END_HOUR,
        sessionMap,
        loadSessions,
        setTreatmentId,
        bookSession,
        nextWeek: () => setWeekStart((prev) => moment(prev).add(7, "day")),
        prevWeek: () => setWeekStart((prev) => moment(prev).subtract(7, "day")),
      }}
    >
      {children}
    </TreatmentSessionsContext.Provider>
  );
}

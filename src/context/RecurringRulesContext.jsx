import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

import { get, post, put, del } from "../config/api";
import moment from "moment-timezone";

const RecurringRulesCtx = createContext(null);

/* ===========================================================
    Helpers
    =========================================================== */
const TZ = "Asia/Bangkok";
const RR2IDX = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function parseRRule(rrule, fallbackDay) {
  const out = { freq: "WEEKLY", byday: [], bysetpos: null };
  if (rrule) {
    const s = String(rrule);
    const f = s.match(/FREQ=([A-Z]+)/i);
    if (f) out.freq = f[1].toUpperCase();
    const d = s.match(/BYDAY=([^;]+)/i);
    if (d) {
      out.byday = d[1]
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((token) => token.slice(-2).toUpperCase()); // תומך גם ב-1MO/-1SU
    }
    const p = s.match(/BYSETPOS=([+-]?\d+)/i);
    if (p) out.bysetpos = Number(p[1]);
  }

  // Fallback: אין BYDAY? נשתמש ב-rule.day (למשל "Tue"/"Tuesday")
  if (!out.byday.length && fallbackDay) {
    const map = {
      sun: "SU",
      sunday: "SU",
      mon: "MO",
      monday: "MO",
      tue: "TU",
      tuesday: "TU",
      wed: "WE",
      wednesday: "WE",
      thu: "TH",
      thursday: "TH",
      fri: "FR",
      friday: "FR",
      sat: "SA",
      saturday: "SA",
    };
    const key = String(fallbackDay).toLowerCase();
    if (map[key]) out.byday = [map[key]];
  }

  return out;
}

function combineDateAndTime(dateOrMoment, hhmm) {
  // ⚡ התיקון: נשתמש ב-moment.utc() כדי לוודא שהזמן של המופע
  // נשלח לשרת בפורמט UTC, וזה אמור לפתור את הכפילות.
  const [hh, mm] = String(hhmm || "00:00")
    .split(":")
    .map((n) => parseInt(n || 0, 10));

  return moment(dateOrMoment)
    .utc() // 👈 שינוי: הוחלף .tz(TZ) ב-.utc()
    .set({ hour: hh || 0, minute: mm || 0, second: 0, millisecond: 0 });
}

function nthWeekdayOfMonth(year, monthIndex0, weekdayIdx, n) {
  const firstOfMonth = moment({ year, month: monthIndex0, day: 1 });
  if (n === -1) {
    const lastOfMonth = firstOfMonth.clone().endOf("month");
    const delta = (lastOfMonth.day() - weekdayIdx + 7) % 7;
    return lastOfMonth.clone().subtract(delta, "days");
  } else {
    const delta = (weekdayIdx - firstOfMonth.day() + 7) % 7;
    const firstWanted = firstOfMonth.clone().add(delta, "days");
    return firstWanted.clone().add(n - 1, "weeks");
  }
}

/* ===========================================================
    Provider
    =========================================================== */
export function RecurringRulesProvider({ children }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------- GET ---------- */
  const loadRules = useCallback(async (workshopId = null) => {
    setLoading(true);
    setError(null);
    try {
      const query = workshopId ? `?workshopId=${workshopId}` : "";
      const res = await get(`/recurring-rules${query}`);
      setRules(Array.isArray(res) ? res : res?.data || []);
    } catch (e) {
      console.error("❌ Failed to load recurring rules:", e);
      setError(e.message || "Failed to load recurring rules");
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- POST ---------- */
  const createRule = useCallback(async (ruleData) => {
    setError(null);
    try {
      // 🧩 1. צור חוק חדש
      const newRule = await post("/recurring-rules", ruleData);
      setRules((prev) => [...prev, newRule]);

      // 🪄 2. הפעל מיד יצירת סשנים לחוק הזה
      await post("/sessions/generate", { ruleId: newRule._id });

      console.log("✅ Rule created and sessions generated successfully!");
      return newRule;
    } catch (e) {
      console.error("❌ Failed to create rule or generate sessions:", e);
      setError(e.message || "Failed to create rule");
      throw e;
    }
  }, []);

  /* ---------- PUT ---------- */
  const updateRule = useCallback(async (ruleId, ruleData) => {
    setError(null);
    try {
      const updatedRule = await put(`/recurring-rules/${ruleId}`, ruleData);
      setRules((prev) => prev.map((r) => (r._id === ruleId ? updatedRule : r)));
      return updatedRule;
    } catch (e) {
      setError(e.message || "Failed to update rule");
      throw e;
    }
  }, []);

  /* ---------- DELETE ---------- */
  const deleteRule = useCallback(async (ruleId) => {
    setError(null);
    try {
      await del(`/recurring-rules/${ruleId}`);
      setRules((prev) => prev.filter((r) => r._id !== ruleId));
    } catch (e) {
      setError(e.message || "Failed to delete rule");
      throw e;
    }
  }, []);

  /* ===========================================================
      Expand rules into occurrences for a given week
      =========================================================== */
  const getOccurrencesForWeek = useCallback(
    (workshopId, weekStart, weekEnd) => {
      const wid = String(workshopId);
      const relevant = rules.filter((r) => {
        const rid =
          r?.workshopId?._id ??
          r?.workshopId ??
          r?.workshop?._id ??
          r?.workshop_id ??
          null;
        return String(rid) === wid;
      });

      const occurrences = [];

      relevant.forEach((rule) => {
        if (!rule?.isActive) return;

        const { freq, byday, bysetpos } = parseRRule(rule.rrule, rule.day);
        const effectiveFrom = rule.effectiveFrom
          ? moment.tz(rule.effectiveFrom, TZ)
          : null;
        const startTime = rule.startTime || "00:00";
        const duration = Number(rule.durationMin ?? rule.duration ?? 60);
        const studio = rule.studio || "Studio A";

        if (freq === "WEEKLY" && byday.length) {
          byday.forEach((d2) => {
            const weekdayIdx = RR2IDX[d2];
            if (weekdayIdx == null) return;

            const dayM = moment.tz(weekStart, TZ).clone().day(weekdayIdx);
            if (dayM.isBefore(weekStart, "day")) dayM.add(7, "days");
            if (effectiveFrom && dayM.isBefore(effectiveFrom, "day")) return;

            const start = combineDateAndTime(dayM, startTime);

            // 🟢 תיקון קודם: הסרת .tz(TZ) המיותר
            const end = moment(start).add(duration, "minutes");

            if (dayM.isBetween(weekStart, weekEnd, "day", "[]")) {
              occurrences.push({
                _id: `${rule._id}-${dayM.format("YYYYMMDD")}`,
                ruleId: rule._id,
                workshopId: wid,
                title: rule.title || "",
                studio,
                start: start.toDate(),
                end: end.toDate(),
                durationMin: duration,
              });
            }
          });
        }

        // monthly נשאר אותו דבר, פשוט להוסיף moment.tz בכל מקום שיש moment(...)
      });

      return occurrences.sort((a, b) => a.start - b.start);
    },
    [rules]
  );

  const value = useMemo(
    () => ({
      rules,
      loading,
      error,
      loadRules,
      createRule,
      updateRule,
      deleteRule,
      getOccurrencesForWeek,
    }),
    [
      rules,
      loading,
      error,
      loadRules,
      createRule,
      updateRule,
      deleteRule,
      getOccurrencesForWeek,
    ]
  );

  return (
    <RecurringRulesCtx.Provider value={value}>
      {children}
    </RecurringRulesCtx.Provider>
  );
}

/* ===========================================================
    Hook
    =========================================================== */
export function useRecurringRules() {
  const context = useContext(RecurringRulesCtx);
  if (!context) {
    throw new Error(
      "useRecurringRules must be used within a RecurringRulesProvider"
    );
  }
  return context;
}

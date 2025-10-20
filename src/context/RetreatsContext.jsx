// 📁 src/context/RetreatsContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { get } from "../config/api";

/* ===========================
   Helpers
   =========================== */
const toDate = (v) => (v instanceof Date ? v : new Date(v));
const MS_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (dLike) => {
  const d = toDate(dLike);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const isOneDay = (r) => isSameDay(r.startDate, r.endDate);

const pickHero = (r) =>
  r?.hero ||
  r?.gallery?.[0]?.url ||
  "https://images.unsplash.com/photo-1501117716987-c8e3f1f1a3ed?q=80&w=1400&auto=format&fit=crop";

const dateRangeLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const s = toDate(startDate);
  const e = toDate(endDate);

  if (isSameDay(s, e)) {
    return s
      .toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      .toUpperCase();
  }

  const sameMonth =
    s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth();

  if (sameMonth) {
    const d1 = s.toLocaleDateString("en-GB", { day: "numeric" });
    const d2 = e
      .toLocaleDateString("en-GB", { day: "numeric", month: "long" })
      .toUpperCase();
    return `${d1}-${d2}`;
  }

  const d1 = s
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
  const d2 = e
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
  return `${d1} - ${d2}`;
};

/* ===========================
   Status rules
   =========================== */
const computeStatus = (r, todayMs, plus60Ms) => {
  if (r?.isPrivate) return "private";
  if (r?.isClosed) return "private";
  if (r?.soldOut) return "private";
  if (typeof r?.spotsLeft === "number" && r.spotsLeft <= 0) return "soon";
  if (r?.published === false) return "soon";

  const startMs = startOfDay(r.startDate).getTime();
  if (startMs > plus60Ms) return "soon"; // farther than 60 days → SOON
  if (startMs >= todayMs) return "book"; // within 60 days → BOOK
  return "book"; // running/past fallback
};

const mapCard = (r, todayMs, plus60Ms) => ({
  id: r._id || r.name,
  title: r.name,
  place: r.location || r.place || "",
  dateLabel: dateRangeLabel(r.startDate, r.endDate),
  status: computeStatus(r, todayMs, plus60Ms), // "book" | "soon" | "private"
  image: pickHero(r),
});

/* ===========================
   Context
   =========================== */
const RetreatsCtx = createContext(null);

export function RetreatsProvider({ children }) {
  const [retreats, setRetreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // Server should return ALL public retreats (no 30-day window).
      const list = await get("/retreats");
      setRetreats(Array.isArray(list) ? list : []);
      setLastFetchedAt(new Date());
    } catch (e) {
      setErr(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ---------- Reference dates ---------- */
  const todayMs = useMemo(() => startOfDay(new Date()).getTime(), []);
  const plus30Ms = useMemo(() => todayMs + 30 * MS_DAY, [todayMs]);
  const plus60Ms = useMemo(() => todayMs + 60 * MS_DAY, [todayMs]);

  /* ---------- Sort all ---------- */
  const allSorted = useMemo(
    () =>
      (retreats || [])
        .slice()
        .sort(
          (a, b) =>
            startOfDay(a.startDate).getTime() -
            startOfDay(b.startDate).getTime()
        ),
    [retreats]
  );

  /* ---------- Future (NO 30-day limit) ---------- */
  const futureRetreats = useMemo(
    () => allSorted.filter((r) => startOfDay(r.endDate).getTime() >= todayMs),
    [allSorted, todayMs]
  );

  /* ---------- Upcoming 30d (kept for convenience, NOT used to hide others) ---------- */
  const upcomingRetreats = useMemo(
    () =>
      allSorted.filter((r) => {
        const s = startOfDay(r.startDate).getTime();
        const e = startOfDay(r.endDate).getTime();
        return s <= plus30Ms && e >= todayMs;
      }),
    [allSorted, plus30Ms, todayMs]
  );

  /* ---------- Buckets ---------- */
  const oneDayList = useMemo(
    () => futureRetreats.filter(isOneDay),
    [futureRetreats]
  );
  const multiDayList = useMemo(
    () => futureRetreats.filter((r) => !isOneDay(r)),
    [futureRetreats]
  );

  /* ---------- Cards (ready for UI) ---------- */
  const oneDayCards = useMemo(
    () => oneDayList.map((r) => mapCard(r, todayMs, plus60Ms)),
    [oneDayList, todayMs, plus60Ms]
  );
  const multiDayCards = useMemo(
    () => multiDayList.map((r) => mapCard(r, todayMs, plus60Ms)),
    [multiDayList, todayMs, plus60Ms]
  );

  /* ---------- Calendar map ---------- */
  const calendarMap = useMemo(() => {
    const days = {};
    for (const r of allSorted) {
      const start = startOfDay(r.startDate);
      const end = startOfDay(r.endDate);
      const cur = new Date(start);
      while (cur.getTime() <= end.getTime()) {
        const iso = cur.toISOString().slice(0, 10);
        if (!days[iso]) days[iso] = [];
        days[iso].push({
          id: r._id,
          type: r.type,
          color: r.color || "#66bb6a",
          name: r.name,
        });
        cur.setDate(cur.getDate() + 1);
      }
    }
    return { days };
  }, [allSorted]);

  const getById = useCallback(
    (id) => allSorted.find((r) => String(r._id) === String(id)),
    [allSorted]
  );

  const value = {
    /* state */
    loading,
    error,
    lastFetchedAt,

    /* raw lists */
    retreats: allSorted, // ALL (sorted)
    futureRetreats, // ALL future (no 30-day limit)
    upcomingRetreats, // Only next 30 days (optional)

    /* buckets/cards for UI */
    oneDayCards, // from ALL future
    multiDayCards, // from ALL future
    calendarMap,

    /* helpers */
    refresh: fetchAll,
    getById,
  };

  return <RetreatsCtx.Provider value={value}>{children}</RetreatsCtx.Provider>;
}

export function useRetreats() {
  const ctx = useContext(RetreatsCtx);
  if (!ctx) throw new Error("useRetreats must be used within RetreatsProvider");
  return ctx;
}

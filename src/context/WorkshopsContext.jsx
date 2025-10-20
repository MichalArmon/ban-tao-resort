import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { get, post, put, del } from "../config/api";

/* ============
   API calls
   ============ */
async function apiListWorkshops(params = {}) {
  // לדוגמה: { q, category, isActive, limit, skip, select, sort }
  const qs = new URLSearchParams(params).toString();
  return get(`/workshops${qs ? `?${qs}` : ""}`);
}

async function apiGetWorkshop(slug) {
  return get(`/workshops/${encodeURIComponent(slug)}`);
}

async function apiCreateWorkshop(payload) {
  return post(`/workshops`, payload);
}

async function apiUpdateWorkshop(slug, payload) {
  return put(`/workshops/${encodeURIComponent(slug)}`, payload);
}

async function apiDeleteWorkshop(slug) {
  return del(`/workshops/${encodeURIComponent(slug)}`);
}

/* ============
   Context
   ============ */
const WorkshopsCtx = createContext(null);

export function WorkshopsProvider({ children }) {
  // Cache בסיסי לרשימה ולפריטים בודדים
  const cacheListRef = useRef(null); // שומר את התוצאה האחרונה של list
  const cacheItemRef = useRef(new Map()); // slug -> item

  const [items, setItems] = useState([]); // לרנדר בעמודים
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ----------
     List
     ---------- */
  const listWorkshops = useCallback(
    async (params = { isActive: true, sort: "title", limit: 200 }) => {
      try {
        setError(null);
        setLoading(true);
        const res = await apiListWorkshops(params);
        const next = res?.items ?? [];
        setItems(next);
        setTotal(res?.total ?? next.length);
        cacheListRef.current = { params, res };
        // קאש לפריטים בודדים
        for (const it of next) {
          if (it?.slug) cacheItemRef.current.set(it.slug, it);
        }
        return next;
      } catch (e) {
        console.error("listWorkshops failed:", e);
        setError(e?.message || "Failed to load workshops");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ----------
     Get by slug (משתמש בקאש אם קיים)
     ---------- */
  const getWorkshop = useCallback(async (slug) => {
    if (!slug) return null;
    if (cacheItemRef.current.has(slug)) {
      return cacheItemRef.current.get(slug);
    }
    try {
      const doc = await apiGetWorkshop(slug);
      cacheItemRef.current.set(slug, doc);
      return doc;
    } catch (e) {
      console.error("getWorkshop failed:", e);
      throw e;
    }
  }, []);

  /* ----------
     Mutations (CRUD) — לשימוש באדמין
     ---------- */
  const createWorkshop = useCallback(async (payload) => {
    const created = await apiCreateWorkshop(payload);
    // עדכון קאש
    if (created?.slug) cacheItemRef.current.set(created.slug, created);
    setItems((arr) => {
      const exists = arr.some((x) => x.slug === created.slug);
      return exists
        ? arr.map((x) => (x.slug === created.slug ? created : x))
        : [created, ...arr];
    });
    setTotal((t) => t + 1);
    return created;
  }, []);

  const updateWorkshop = useCallback(async (slug, payload) => {
    const updated = await apiUpdateWorkshop(slug, payload);
    if (updated?.slug) cacheItemRef.current.set(updated.slug, updated);
    setItems((arr) => arr.map((x) => (x.slug === slug ? updated : x)));
    return updated;
  }, []);

  const deleteWorkshop = useCallback(async (slug) => {
    await apiDeleteWorkshop(slug);
    cacheItemRef.current.delete(slug);
    setItems((arr) => arr.filter((x) => x.slug !== slug));
    setTotal((t) => Math.max(0, t - 1));
    return true;
  }, []);

  /* ----------
     טעינה ראשונית — פעיל בלבד
     ---------- */
  useEffect(() => {
    // טוען כברירת מחדל את הפעילים, מסודרים לפי title
    listWorkshops({ isActive: true, sort: "title", limit: 200 });
  }, [listWorkshops]);

  const value = useMemo(
    () => ({
      // state
      items,
      total,
      loading,
      error,
      // actions
      listWorkshops,
      getWorkshop,
      createWorkshop,
      updateWorkshop,
      deleteWorkshop,
    }),
    [
      items,
      total,
      loading,
      error,
      listWorkshops,
      getWorkshop,
      createWorkshop,
      updateWorkshop,
      deleteWorkshop,
    ]
  );

  return (
    <WorkshopsCtx.Provider value={value}>{children}</WorkshopsCtx.Provider>
  );
}

export function useWorkshops() {
  const ctx = useContext(WorkshopsCtx);
  if (!ctx)
    throw new Error("useWorkshops must be used within WorkshopsProvider");
  return ctx;
}

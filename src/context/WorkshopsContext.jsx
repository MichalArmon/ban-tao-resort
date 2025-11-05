// 📁 src/context/WorkshopsContext.jsx
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

/* =========================================
   API calls — תקשורת עם השרת
   ========================================= */
async function apiListWorkshops(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return get(`/workshops${qs ? `?${qs}` : ""}`);
}

// לפי SLUG (לצד האורח)
async function apiGetWorkshop(slug) {
  return get(`/workshops/${encodeURIComponent(slug)}`);
}

// לפי ID (לצד האדמין)
async function apiGetWorkshopById(id) {
  return get(`/workshops/id/${id}`);
}

async function apiCreateWorkshop(payload) {
  return post(`/workshops`, payload);
}

// לפי SLUG (לצד האורח)
async function apiUpdateWorkshop(slug, payload) {
  return put(`/workshops/${encodeURIComponent(slug)}`, payload);
}

// לפי ID (לצד האדמין)
async function apiUpdateWorkshopById(id, payload) {
  return put(`/workshops/id/${id}`, payload);
}

async function apiDeleteWorkshop(slug) {
  return del(`/workshops/${encodeURIComponent(slug)}`);
}

/* =========================================
   Context
   ========================================= */
const WorkshopsCtx = createContext(null);

export function WorkshopsProvider({ children }) {
  const cacheListRef = useRef(null);
  const cacheItemRef = useRef(new Map()); // slug -> item

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =========================================
     📜 listWorkshops — שליפת כל הסדנאות
     ========================================= */
  const listWorkshops = useCallback(
    async (params = { sort: "title", limit: 200 }) => {
      try {
        setError(null);
        setLoading(true);

        const res = await apiListWorkshops(params);
        const next = Array.isArray(res) ? res : res?.items ?? [];

        setItems(next);
        setTotal(res?.total ?? next.length);

        cacheListRef.current = { params, res };
        for (const it of next) {
          if (it?.slug) cacheItemRef.current.set(it.slug, it);
        }

        return next;
      } catch (e) {
        console.error("listWorkshops failed:", e);
        setError(e?.message || "שגיאה בטעינת הסדנאות");
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* =========================================
     📘 getWorkshop — לפי SLUG (לאורחים)
     ========================================= */
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

  /* =========================================
     📘 getWorkshopById — לפי ID (לאדמין)
     ========================================= */
  const getWorkshopById = useCallback(async (id) => {
    if (!id) return null;
    try {
      const doc = await apiGetWorkshopById(id);
      return doc;
    } catch (e) {
      console.error("getWorkshopById failed:", e);
      throw e;
    }
  }, []);

  /* =========================================
     ✳️ createWorkshop — יצירת סדנה חדשה
     ========================================= */
  const createWorkshop = useCallback(async (payload) => {
    const created = await apiCreateWorkshop(payload);
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

  /* =========================================
     🔁 updateWorkshop — לפי SLUG (לאורח)
     ========================================= */
  const updateWorkshop = useCallback(async (slug, payload) => {
    const updated = await apiUpdateWorkshop(slug, payload);
    if (updated?.slug) cacheItemRef.current.set(updated.slug, updated);
    setItems((arr) => arr.map((x) => (x.slug === slug ? updated : x)));
    return updated;
  }, []);

  /* =========================================
     🔁 updateWorkshopById — לפי ID (לאדמין)
     ========================================= */
  const updateWorkshopById = useCallback(async (id, payload) => {
    const updated = await apiUpdateWorkshopById(id, payload);
    if (updated?.slug) cacheItemRef.current.set(updated.slug, updated);
    setItems((arr) => arr.map((x) => (x._id === id ? updated : x)));
    return updated;
  }, []);

  /* =========================================
     ❌ deleteWorkshop
     ========================================= */
  const deleteWorkshop = useCallback(async (slug) => {
    await apiDeleteWorkshop(slug);
    cacheItemRef.current.delete(slug);
    setItems((arr) => arr.filter((x) => x.slug !== slug));
    setTotal((t) => Math.max(0, t - 1));
    return true;
  }, []);

  /* =========================================
     ⏱️ טעינה ראשונית
     ========================================= */
  useEffect(() => {
    listWorkshops({ sort: "title", limit: 200 });
  }, [listWorkshops]);

  /* =========================================
     ערך הקונטקסט
     ========================================= */
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
      getWorkshopById,
      createWorkshop,
      updateWorkshop,
      updateWorkshopById,
      deleteWorkshop,
    }),
    [
      items,
      total,
      loading,
      error,
      listWorkshops,
      getWorkshop,
      getWorkshopById,
      createWorkshop,
      updateWorkshop,
      updateWorkshopById,
      deleteWorkshop,
    ]
  );

  return (
    <WorkshopsCtx.Provider value={value}>{children}</WorkshopsCtx.Provider>
  );
}

/* =========================================
   Hook נוח לשימוש בקומפוננטות
   ========================================= */
export function useWorkshops() {
  const ctx = useContext(WorkshopsCtx);
  if (!ctx)
    throw new Error("useWorkshops must be used within WorkshopsProvider");
  return ctx;
}

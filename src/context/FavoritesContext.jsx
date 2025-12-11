// 📁 src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { GLOBAL_API_BASE } from "../config/api";

const FavoritesContext = createContext();
export const useFavorites = () => useContext(FavoritesContext);

// 🔑 מיפוי בין סוג לאוסף ב-state
const TYPE_KEY_MAP = {
  room: "rooms",
  retreat: "retreats",
  workshop: "workshops",
  treatment: "treatments",
};

export function FavoritesProvider({ children }) {
  const { user, token } = useUser();

  const [favorites, setFavorites] = useState({
    rooms: [],
    retreats: [],
    workshops: [],
    treatments: [],
  });

  const [loading, setLoading] = useState(false);

  const API = `${GLOBAL_API_BASE}/favorites`;

  /* ----------------------------------------------------
     🟢 Load favorites when user logs in
  ---------------------------------------------------- */
  useEffect(() => {
    if (!user?._id) {
      setFavorites({
        rooms: [],
        retreats: [],
        workshops: [],
        treatments: [],
      });
      return;
    }
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  /* ----------------------------------------------------
     🟢 Fetch favorites from backend
  ---------------------------------------------------- */
  const loadFavorites = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/${user._id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const data = await res.json();

      setFavorites({
        rooms: data.rooms || [],
        retreats: data.retreats || [],
        workshops: data.workshops || [],
        treatments: data.treatments || [],
      });
    } catch (err) {
      console.error("Favorites load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
     🔄 Toggle Favorite
  ---------------------------------------------------- */
  const toggleFavorite = async (itemId, itemType, item) => {
    if (!user?._id) return alert("You must be logged in");

    const key = TYPE_KEY_MAP[itemType];
    if (!key) {
      console.warn("Unknown itemType for favorites:", itemType);
      return;
    }

    console.log("Sending to backend:", {
      user: user._id,
      itemId,
      itemType,
    });

    const res = await fetch(`${API}/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify({
        itemId,
        itemType,
        item,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Toggle error:", data);
      return;
    }

    // 🟢 עדכון מקומי — משתמשים ב-key של האוסף (rooms / retreats / ...)
    setFavorites((prev) => {
      const list = prev[key] || [];

      const exists = list.some((f) => {
        const fid =
          f._id?.toString?.() || f.itemId?.toString?.() || f.id?.toString?.();
        return fid === String(itemId);
      });

      // ❌ Remove
      if (exists) {
        return {
          ...prev,
          [key]: list.filter((f) => {
            const fid =
              f._id?.toString?.() ||
              f.itemId?.toString?.() ||
              f.id?.toString?.();
            return fid !== String(itemId);
          }),
        };
      }

      // ✅ Add item (דואגים שתמיד יהיה _id)
      const fullItem = { ...item, _id: item._id || itemId };

      return {
        ...prev,
        [key]: [...list, fullItem],
      };
    });
  };

  /* ----------------------------------------------------
     ❓ Check if an item is favorited (SAFE)
  ---------------------------------------------------- */
  const isFavorite = (itemId) => {
    if (!itemId) return false;
    const idStr = String(itemId);

    const collections = [
      ...(favorites.rooms || []),
      ...(favorites.retreats || []),
      ...(favorites.workshops || []),
      ...(favorites.treatments || []),
    ];

    return collections.some((f) => {
      const fid =
        f._id?.toString?.() || f.itemId?.toString?.() || f.id?.toString?.();
      return fid === idStr;
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

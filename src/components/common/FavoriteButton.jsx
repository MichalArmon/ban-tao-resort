import { IconButton } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useUser } from "../../context/UserContext";
import { useFavorites } from "../../context/FavoritesContext";

export default function FavoriteButton({ itemId, itemType, item }) {
  const { user } = useUser();
  const { isFavorite, toggleFavorite } = useFavorites();

  // 🟢 מנקה ID במידה והוא אובייקט
  const cleanId =
    typeof itemId === "object" ? itemId.itemId || itemId._id || null : itemId;

  const liked = isFavorite(cleanId);

  const handleClick = () => {
    // 🟢 בדיקה נכונה למשתמש מחובר
    if (!user?._id) return alert("Please log in first ❤️");

    console.log("FavoriteButton sending:", {
      itemId: cleanId,
      itemType,
      item,
    });

    // 🟢 שולחים גם אובייקט מלא, ואם אין — שולחים בסיסי
    toggleFavorite(cleanId, itemType, item || { _id: cleanId });
  };

  return (
    <IconButton onClick={handleClick} sx={{ color: liked ? "red" : "#aaa" }}>
      {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
    </IconButton>
  );
}

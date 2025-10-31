// במקום ה-<Button> הקיים בכרטיס (חדר/סדנה/טיפול/ריטריט)
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BookButton({
  type,
  item,
  selectedDate,
  guests = 2,
  price = item.price,
}) {
  const navigate = useNavigate();
  return (
    <Button
      variant="contained"
      onClick={() =>
        navigate("/resort/guest/checkout", {
          state: {
            type, // "room" | "workshop" | "treatment" | "retreat"
            item: {
              id: item._id,
              title: item.title || item.name,
              hero: item.hero?.url || item.heroUrl,
              location: item.location || "Ban Tao Resort",
            },
            dates: {
              // לחדרים:
              checkIn: null, // ISO string; מלאי כשזה חדר
              checkOut: null,
              // לסדנה/טיפול/ריטריט:
              sessionDate: selectedDate || null,
            },
            guests,
            price,
            currency: "ILS",
          },
        })
      }
    >
      BOOK
    </Button>
  );
}

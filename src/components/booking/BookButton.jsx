// 📁 src/components/booking/BookButton.jsx
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { useRooms } from "../../context/RoomContext";
import { useSessions } from "../../context/SessionsContext";

export default function BookButton({
  type,
  item,
  selectedDate,
  guests, // guests is optional now
  price = item?.price || 0,
  ruleId = null,
  sessionId = null,
}) {
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  // Guests from contexts
  const { guests: roomGuests } = useRooms();
  const { sessionGuests } = useSessions();

  // Final guests resolution
  const finalGuests =
    guests !== undefined
      ? guests
      : type === "workshop"
      ? sessionGuests
      : type === "room"
      ? roomGuests
      : 1; // for retreats or anything else

  const handleBook = () => {
    if (!item?._id) {
      console.error("❌ Missing item._id in BookButton");
      return;
    }

    const sessionDate = selectedDate || null;

    const newSelection = {
      type,
      item: {
        id: item._id,
        title: item.title || item.name || "Untitled",
        hero: item.hero?.url || item.heroUrl || null,
        description: item.description,
        location: item.location || "Ban Tao Resort",
      },

      // DATE + TIME
      sessionDate,
      sessionId: sessionId || null,

      // GUESTS
      guests: finalGuests,

      price,
      currency: "ILS",
      ruleId,
    };

    console.log("✅ Setting selection:", newSelection);
    setSelection(newSelection);
    navigate("/resort/guest/checkout");
  };

  return (
    <Button variant="contained" onClick={handleBook}>
      BOOK
    </Button>
  );
}

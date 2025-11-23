import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
import { useRooms } from "../../context/RoomContext";
import { useSessions } from "../../context/SessionsContext";
import { useDateSelection } from "../../context/DateSelectionContext"; // 🟢 ייבוא נחוץ

export default function BookButton({
  type = "room", // "room" | "workshop" | "retreat"
  item,
  selectedDate = null,
  guests, // Optional override
  price = item?.priceBase || item?.price || 0,
  ruleId = null,
  sessionId = null,
}) {
  const navigate = useNavigate();
  const { setSelection } = useBooking(); // 🟢 קבלת התאריכים הנבחרים
  const { checkIn, checkOut } = useDateSelection(); // Guests fallback by type

  const { guests: roomGuests } = useRooms();
  const { sessionGuests } = useSessions();

  const finalGuests =
    guests !== undefined
      ? guests
      : type === "workshop"
      ? sessionGuests
      : type === "room"
      ? roomGuests
      : 1;

  const handleBook = () => {
    if (!item?._id && !item?.id && !item?.slug) {
      console.error(
        "❌ Missing required item identifiers in BookButton:",
        item
      );
      return;
    }

    const sessionDate = selectedDate || null; // 🧩 Build the selection object that Checkout will use

    const newSelection = {
      type,
      item: {
        id: item._id || item.id || null,
        title: item.title || item.name || "Untitled",
        slug: item.slug || null, // Visual

        hero:
          item.hero?.url ||
          item.heroUrl ||
          item.image?.url ||
          item.images?.[0]?.url ||
          null, // Informational

        description: item.description || item.blurb || "",
        location: item.location || "Ban Tao Resort",
        roomType: item.type || item.roomType || null,
        maxGuests: item.maxGuests ?? null,
        features: item.features ?? [],
        priceBase: item.priceBase || price || 0,
      }, // 🟢 הוספת תאריכי החדר לרמת השורש של selection

      ...(type === "room" &&
        checkIn &&
        checkOut && {
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
        }), // DATE + TIME (only relevant for workshops/retreats)

      sessionDate,
      sessionId: sessionId || null, // GUESTS

      guests: finalGuests, // PRICE

      priceBase: price, // 👈 שומרים את המחיר הבסיסי שוב
      currency: item.currency || "USD", // RULE

      ruleId,
    };

    console.log("🏁 Final Selection Saved:", newSelection);
    setSelection(newSelection); // Navigate to Checkout

    navigate("/resort/guest/checkout");
  };

  return (
    <Button variant="contained" onClick={handleBook}>
            BOOK    {" "}
    </Button>
  );
}

// 📁 src/components/booking/BookButton.jsx
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";

export default function BookButton({
  type,
  item,
  selectedDate,
  guests = 2,
  price = item?.price || 0,
  ruleId = null,
  sessionId = null,
}) {
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  const handleBook = () => {
    if (!item?._id) {
      console.error("❌ Missing item._id in BookButton");
      return;
    }

    const newSelection = {
      type,
      item: {
        id: item._id,
        title: item.title || item.name || "Untitled",
        hero: item.hero?.url || item.heroUrl || null,
        description: item.description,
        location: item.location || "Ban Tao Resort",
      },
      dates: {
        checkIn: null,
        checkOut: null,
        sessionDate: selectedDate || null,
      },
      guests,
      price,
      currency: "ILS",
      ruleId,
      sessionId,
    };

    console.log("✅ Setting selection:", newSelection);
    setSelection(newSelection); // ✅ נשמר בקונטקסט
    navigate("/resort/guest/checkout"); // בלי state
  };

  return (
    <Button variant="contained" onClick={handleBook}>
      BOOK
    </Button>
  );
}

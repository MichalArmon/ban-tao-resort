import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
import { useBooking } from "../../context/BookingContext";

const TZ = "Asia/Bangkok";

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

    // ❌ אל תבצעי המרה כפולה – הנתון כבר UTC
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
      sessionDate, // ✅ נשמר כמו שהוא
      sessionId: sessionId || null,
      guests,
      price,
      currency: "ILS",
      ruleId,
      tz: TZ,
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

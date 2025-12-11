import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../../context/BookingContext";
import { useSessions } from "../../../context/SessionsContext";

export default function BookWorkshopButton({
  workshop,
  sessionDate,
  sessionId,
  ruleId,
}) {
  const navigate = useNavigate();
  const { setSelection } = useBooking();
  const { sessionGuests } = useSessions();

  const handleBook = () => {
    if (!workshop?._id) {
      console.error("❌ Missing workshop id in BookWorkshopButton:", workshop);
      return;
    }

    const selection = {
      type: "workshop",
      item: {
        id: workshop._id,
        slug: workshop.slug || null,
        title: workshop.title,
        hero: workshop.hero?.url || null,
        priceBase: workshop.price || 0,
      },
      guests: sessionGuests,
      sessionDate: sessionDate || null,
      sessionId: sessionId || null,
      ruleId: ruleId || null,
      priceBase: workshop.price || 0,
      currency: workshop.currency || "USD",
    };

    setSelection(selection);
    navigate("/resort/guest/checkout");
  };

  return (
    <Button variant="contained" onClick={handleBook}>
      Book
    </Button>
  );
}

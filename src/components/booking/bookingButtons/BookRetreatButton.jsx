import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../../context/BookingContext";

export default function BookRetreatButton({ retreat }) {
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  const handleBook = () => {
    if (!retreat?._id) {
      console.error("❌ Missing retreat id in BookRetreatButton:", retreat);
      return;
    }

    const selection = {
      type: "retreat",
      item: {
        id: retreat._id,
        slug: retreat.slug || null,
        title: retreat.title,
        hero: retreat.hero?.url || null,
        priceBase: retreat.price || 0,
      },
      startDate: retreat.startDate,
      endDate: retreat.endDate,
      guests: retreat.maxGuests || 1,
      priceBase: retreat.price || 0,
      currency: retreat.currency || "USD",
    };

    setSelection(selection);
    navigate("/resort/guest/checkout");
  };

  return (
    <Button variant="contained" onClick={handleBook}>
      Book Retreat
    </Button>
  );
}

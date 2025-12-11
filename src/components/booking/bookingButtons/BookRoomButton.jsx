import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../../context/BookingContext";
import { useRooms } from "../../../context/RoomContext";
import { useDateSelection } from "../../../context/DateSelectionContext";

export default function BookRoomButton({ room }) {
  const navigate = useNavigate();
  const { setSelection } = useBooking();
  const { guests } = useRooms();
  const { checkIn, checkOut } = useDateSelection();

  const handleBook = () => {
    if (!room?._id) {
      console.error("❌ Missing room id in BookRoomButton:", room);
      return;
    }

    const selection = {
      type: "room",
      item: {
        id: room._id,
        slug: room.slug || null,
        title: room.title,
        hero: room.hero?.url || null,
        priceBase: room.priceBase || 0,
        maxGuests: room.maxGuests || null,
        features: room.features || [],
      },
      guests,
      checkIn: checkIn?.toISOString(),
      checkOut: checkOut?.toISOString(),
      priceBase: room.priceBase || 0,
      currency: room.currency || "USD",
    };

    setSelection(selection);
    navigate("/resort/guest/checkout");
  };

  return (
    <Button variant="contained" onClick={handleBook}>
      Book Room
    </Button>
  );
}

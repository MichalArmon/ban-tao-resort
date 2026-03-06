import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../../../context/BookingContext";

export default function BookTreatmentButton({ session, date, hour }) {
  const navigate = useNavigate();
  const { setSelection } = useBooking();

  const handleBook = () => {
    if (!session?._id || !session?.treatment) {
      console.error("❌ Missing session data", session);
      return;
    }

    const selection = {
      type: "treatment",
      item: {
        id: session.treatment,
      },
      sessionId: session._id,

      // 🔥 זה הדבר החשוב
      sessionStart: session.start, // ISO מהשרת
    };

    setSelection(selection);
    navigate("/resort/guest/checkout");
  };

  return (
    <Button
      size="small"
      variant="contained"
      color="success"
      onClick={handleBook}
      sx={{ minWidth: 80 }}
    >
      Book
    </Button>
  );
}

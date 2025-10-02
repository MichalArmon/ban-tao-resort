import { Container, Typography } from "@mui/material";
import AvailabilityBar from "./AvailabilityBar";
import RoomResults from "./RoomResults";

function AvailabilityPage() {
  return (
    <Container
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ width: "100%" }}
    >
      <Typography
        variant="h4"
        component="h1"
        sx={{ mt: 4, mb: 3, textAlign: "center" }}
      >
        Check Room Availability
      </Typography>{" "}
      {/* 🔑 עוטף את הכל ומגביל לרוחב MD (כ-900px) ומיישר למרכז */}
      {/* ⬅️ ה-Box יושב עכשיו בתוך קונטיינר מוגבל רוחב */}
      <AvailabilityBar />
      {/* תוצאות החדרים */}
      <RoomResults />
    </Container>
  );
}

export default AvailabilityPage;

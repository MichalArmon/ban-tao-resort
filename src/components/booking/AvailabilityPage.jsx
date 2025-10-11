import { Container, Typography } from "@mui/material";
import AvailabilityBar from "./AvailabilityBar";
import RoomResults from "./RoomResults";

function AvailabilityPage() {
  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 2, md: 4 }, pb: { xs: 6, md: 10 } }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          mb: { xs: 3, md: 4 },
          fontWeight: 700,
          textAlign: "left",
          color: "primary.main",
          fontSize: { xs: 28, md: 44 },
        }}
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

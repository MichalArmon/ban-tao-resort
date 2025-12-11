import { Container, Typography } from "@mui/material";
import AvailabilityBar from "./AvailabilityBar";
import RoomResults from "./RoomResults";
import FancyHeading from "../FancyHeading";

function AvailabilityPage() {
  return (
    <Container
      maxWidth="lg"
      sx={{ pt: { xs: 2, md: 4 }, pb: { xs: 6, md: 10 } }}
    >
      {/* <Typography
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
      </Typography> */}
      <FancyHeading size="2.8rem" delay={0.2} align="center">
        Check Room Availability
      </FancyHeading>
      <AvailabilityBar />
      <RoomResults />
    </Container>
  );
}

export default AvailabilityPage;

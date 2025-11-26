import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Stack,
  Box,
  Typography,
  Divider,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import PaymentsRounded from "@mui/icons-material/PaymentsRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import moment from "moment";
import SummaryRow from "./SummaryRow";

function formatMoney(n, currency = "ILS") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `${n} ${currency}`;
  }
}

export default function BookingSummary({
  sel,
  submitting,
  onConfirm,
  guestsOverride,
}) {
  const title = sel?.item?.title || "Selected item";
  const img = sel?.item?.hero;
  const basePrice = sel?.priceBase || 0;
  const currency = sel?.currency ?? "USD";
  const totalPrice = sel?.price ?? 0;
  const isRoom = sel?.type === "room";

  // 🟢 אם זה workshop נעדיף את guestsOverride (מה-TextField)
  const guests = isRoom
    ? Number(sel?.guests) || 1
    : Number(guestsOverride ?? sel?.guests ?? 1);

  let dateLine = "Select date/time";
  if (isRoom && sel?.checkIn && sel?.checkOut) {
    dateLine = `${new Date(sel.checkIn).toLocaleDateString()} → ${new Date(
      sel.checkOut
    ).toLocaleDateString()}`;
  } else if (sel?.sessionLabel) {
    dateLine = sel.sessionLabel;
  } else if (sel?.sessionDate) {
    dateLine =
      moment(sel.sessionDate).format("DD.MM.YYYY, HH:mm") +
      (sel?.studio ? ` — ${sel.studio}` : "");
  }

  const totalFormatted = formatMoney(totalPrice, currency);
  const baseFormatted = formatMoney(basePrice, currency);

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {img && <CardMedia component="img" image={img} alt={title} />}
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
        </Box>

        <Stack spacing={1.2} sx={{ my: 1.5 }}>
          <SummaryRow
            icon={<CalendarMonthRounded fontSize="small" />}
            label={isRoom ? "Dates" : "Date"}
            value={dateLine}
          />

          <SummaryRow
            icon={<GroupRounded fontSize="small" />}
            label="Guests"
            value={guests}
          />

          <SummaryRow
            icon={<PlaceRounded fontSize="small" />}
            label="Location"
            value={sel?.item?.location || "On site"}
          />

          <Divider sx={{ my: 1 }} />

          <Stack spacing={0.3}>
            <SummaryRow
              icon={<PaymentsRounded fontSize="small" />}
              label="Total price"
              value={totalFormatted}
            />

            {/* 🏠 אם זה חדר — הצג לפי לילות */}
            {isRoom && sel?.checkIn && sel?.checkOut && basePrice > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4 }}
              >
                {`${baseFormatted} × ${
                  moment(sel.checkOut).diff(moment(sel.checkIn), "days") || 1
                } night${
                  moment(sel.checkOut).diff(moment(sel.checkIn), "days") === 1
                    ? ""
                    : "s"
                }`}
              </Typography>
            )}

            {/* 🎟️ אם זו סדנה — הצג לפי מספר אורחים */}
            {!isRoom && guests > 1 && basePrice > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 4 }}
              >
                {`${baseFormatted} × ${guests} guests`}
              </Typography>
            )}
          </Stack>
        </Stack>

        <Alert severity="info" variant="outlined" sx={{ mt: 2, mb: 2 }}>
          No payment is taken now. You’ll confirm on the next step.
        </Alert>

        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={submitting}
          fullWidth
        >
          {submitting ? <CircularProgress size={22} /> : "Confirm booking"}
        </Button>
      </CardContent>
    </Card>
  );
}

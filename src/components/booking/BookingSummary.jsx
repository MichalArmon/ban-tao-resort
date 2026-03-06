import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Stack,
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

function formatMoney(n, currency = "USD") {
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
  sel, // legacy
  summary, // new (optional)
  submitting,
  onConfirm,
  guestsOverride,
}) {
  /* --------------------------------------------------
     🆕 NEW MODE – explicit summary (Workshops)
  -------------------------------------------------- */
  if (summary) {
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
        {summary.image && (
          <CardMedia
            component="img"
            image={summary.image}
            alt={summary.title}
          />
        )}

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{summary.title}</Typography>

          <Stack spacing={1.2} sx={{ my: 2 }}>
            <SummaryRow
              icon={<CalendarMonthRounded fontSize="small" />}
              label="Date"
              value={summary.dateLine}
            />

            <SummaryRow
              icon={<GroupRounded fontSize="small" />}
              label="Guests"
              value={summary.guests}
            />

            <SummaryRow
              icon={<PlaceRounded fontSize="small" />}
              label="Location"
              value={summary.location || "On site"}
            />

            <Divider sx={{ my: 1 }} />

            <SummaryRow
              icon={<PaymentsRounded fontSize="small" />}
              label="Total price"
              value={formatMoney(summary.price, summary.currency)}
            />
          </Stack>

          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            No payment is taken now. You’ll confirm on the next step.
          </Alert>

          {onConfirm && (
            <Button
              onClick={onConfirm}
              variant="contained"
              fullWidth
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={22} /> : "Confirm booking"}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  /* --------------------------------------------------
     🟢 LEGACY MODE – unchanged (Treatments / Rooms)
  -------------------------------------------------- */
  if (!sel) return null;

  const title = sel?.item?.title || "Selected item";
  const img = sel?.item?.hero;
  const currency = sel?.currency ?? "USD";
  const totalPrice = sel?.price ?? 0;

  const isRoom = sel?.type === "room";

  const guests = isRoom
    ? Number(sel?.guests) || 1
    : Number(guestsOverride ?? sel?.guests ?? 1);

  let dateLine = "Select date & time";

  if (isRoom && sel?.checkIn && sel?.checkOut) {
    dateLine = `${moment(sel.checkIn).format("DD/MM/YYYY")} → ${moment(
      sel.checkOut
    ).format("DD/MM/YYYY")}`;
  } else if (sel?.sessionStart || sel?.sessionDate) {
    dateLine = moment(sel.sessionStart || sel.sessionDate).format(
      "DD/MM/YYYY HH:mm"
    );
  }

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

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{title}</Typography>

        <Stack spacing={1.2} sx={{ my: 2 }}>
          <SummaryRow
            icon={<CalendarMonthRounded fontSize="small" />}
            label="Date"
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

          <SummaryRow
            icon={<PaymentsRounded fontSize="small" />}
            label="Total price"
            value={formatMoney(totalPrice, currency)}
          />
        </Stack>

        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          No payment is taken now. You’ll confirm on the next step.
        </Alert>

        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            fullWidth
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={22} /> : "Confirm booking"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

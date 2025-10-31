import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import moment from "moment";
import { useSchedule } from "../../../context/ScheduleContext";

const DOW_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function GuestScheduleView({
  open,
  onClose,
  workshop,
  defaultDate,
  onBook,
}) {
  const { guestSchedule, guestLoading, loadGuestSchedule, error } =
    useSchedule();

  const [weekStart, setWeekStart] = React.useState(() =>
    moment(defaultDate || new Date()).startOf("week")
  );
  const weekEnd = weekStart.clone().endOf("week");

  React.useEffect(() => {
    if (!open || !workshop?._id) return;

    const from = weekStart.format("YYYY-MM-DD");
    const to = weekEnd.format("YYYY-MM-DD");

    const key = `${workshop._id}_${from}_${to}`;
    if (window.__lastGuestLoadKey === key) return;
    window.__lastGuestLoadKey = key;

    console.log("📅 trying loadGuestSchedule", { open, workshop, from, to });
    loadGuestSchedule(from, to);
  }, [open, workshop?._id, weekStart, weekEnd]);

  const occurrences = React.useMemo(() => {
    if (!open || !workshop?._id) return [];
    return guestSchedule.filter(
      (s) => String(s.workshopId) === String(workshop._id)
    );
  }, [guestSchedule, open, workshop?._id]);

  const prevWeek = () => setWeekStart((m) => m.clone().subtract(7, "days"));
  const nextWeek = () => setWeekStart((m) => m.clone().add(7, "days"));

  const days = React.useMemo(() => {
    const map = new Map();
    occurrences.forEach((occ) => {
      const key = moment(occ.start).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(occ);
    });
    return Array.from(map.entries())
      .map(([k, items]) => ({
        date: moment(k).toDate(),
        items: items.sort((a, b) => a.start - b.start),
      }))
      .sort((a, b) => a.date - b.date);
  }, [occurrences]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" fontWeight={800}>
          {workshop?.title ?? ""}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pb: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h5" fontWeight={700}>
            🕒 Daily Workshop Schedule
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              onClick={prevWeek}
              startIcon={<ChevronLeftRounded />}
              variant="outlined"
            >
              PREVIOUS WEEK
            </Button>
            <Chip
              icon={<CalendarMonthRounded />}
              label={`${weekStart.format("MM/DD")} - ${weekEnd.format(
                "MM/DD"
              )}`}
              variant="outlined"
            />
            <Button
              size="small"
              onClick={nextWeek}
              endIcon={<ChevronRightRounded />}
              variant="outlined"
            >
              NEXT WEEK
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {guestLoading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!guestLoading && !error && days.length === 0 && (
          <Alert severity="info">No sessions in this week.</Alert>
        )}

        {!guestLoading &&
          !error &&
          days.map((bucket) => (
            <Paper
              key={+bucket.date}
              variant="outlined"
              sx={{ mb: 2, overflow: "hidden" }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  opacity: 0.55,
                }}
              >
                <Typography fontWeight={700}>
                  {DOW_LABELS[new Date(bucket.date).getDay()]},{" "}
                  {moment(bucket.date).format("MM/DD/YYYY")}
                </Typography>
              </Box>

              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        bgcolor: "action.hover",
                        fontWeight: 700,
                      },
                    }}
                  >
                    <TableCell width="22%">Time</TableCell>
                    <TableCell>Workshop / Class</TableCell>
                    <TableCell width="18%">Studio</TableCell>
                    <TableCell align="right" width="18%">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {bucket.items.map((occ) => {
                    const range = `${moment(occ.start).format(
                      "HH:mm"
                    )} - ${moment(occ.end).format("HH:mm")}`;
                    return (
                      <TableRow key={occ._id}>
                        <TableCell>{range}</TableCell>
                        <TableCell>{workshop.title}</TableCell>
                        <TableCell>{occ.studio}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => onBook?.(occ)}
                          >
                            BOOK NOW
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          ))}
      </DialogContent>
    </Dialog>
  );
}

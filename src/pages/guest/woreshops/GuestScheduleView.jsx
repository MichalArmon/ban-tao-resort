// 📁 src/pages/guest/GuestScheduleView.jsx
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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import moment from "moment";

import BookButton from "../../../components/booking/BookButton";
import { useSessions } from "../../../context/SessionsContext";

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
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { sessions, loading, error, loadSessions } = useSessions();

  const [weekStart, setWeekStart] = React.useState(() =>
    moment(defaultDate || new Date()).startOf("week")
  );
  const weekEnd = weekStart.clone().endOf("week");

  /* ---------------------------------------------
      Load sessions for the selected week
  --------------------------------------------- */
  React.useEffect(() => {
    if (!open || !workshop?._id) return;
    const from = weekStart.toDate();
    const to = weekEnd.toDate();
    loadSessions({ from, to, workshopId: workshop._id });
  }, [open, workshop?._id, weekStart, weekEnd, loadSessions]);

  /* ---------------------------------------------
      Group sessions by day (using startLocal)
  --------------------------------------------- */
  const days = React.useMemo(() => {
    if (!sessions?.length) return [];
    const relevant = sessions.filter(
      (s) => String(s.workshopId) === String(workshop._id)
    );

    const map = new Map();
    relevant.forEach((occ) => {
      const key = moment(occ.startLocal).format("YYYY-MM-DD");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(occ);
    });

    return Array.from(map.entries())
      .map(([k, items]) => ({
        date: new Date(k),
        items: items.sort(
          (a, b) => new Date(a.startLocal) - new Date(b.startLocal)
        ),
      }))
      .sort((a, b) => a.date - b.date);
  }, [sessions, workshop?._id]);

  const prevWeek = () => setWeekStart((m) => m.clone().subtract(7, "days"));
  const nextWeek = () => setWeekStart((m) => m.clone().add(7, "days"));

  /* ---------------------------------------------
      🆕 פונקציה ליצירת רכיב הסטטוס
  --------------------------------------------- */
  const createAvailabilityStatus = (occ) => {
    const capacity = occ.availability?.capacity ?? 0;
    const booked = occ.availability?.booked ?? 0;
    const remaining = Math.max(capacity - booked, 0);
    const isFull = remaining <= 0;

    return (
      <Typography
        variant="caption"
        component="span"
        sx={{
          color: isFull ? "error.main" : "success.main",
          fontWeight: 600,
          display: "block",
          mt: isMobile ? 0 : 0.5,
          mb: isMobile ? 1 : 0,
        }}
      >
        {isFull
          ? "Fully Booked"
          : `${remaining} spots left! (${booked} booked)`}
      </Typography>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      disablePortal
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          pr: 6,
          py: { xs: 1.5, sm: 2 },
          position: "relative",
          bgcolor: isMobile ? "background.paper" : "transparent",
        }}
      >
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
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

      <DialogContent dividers sx={{ pb: { xs: 1, sm: 3 } }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          alignItems={isMobile ? "stretch" : "center"}
          justifyContent="space-between"
          sx={{ mb: 2, gap: isMobile ? 1.5 : 0 }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h5"}
            fontWeight={700}
            textAlign={isMobile ? "center" : "left"}
          >
            🕒 Daily Workshop Schedule
          </Typography>

          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={1}
            alignItems={isMobile ? "stretch" : "center"}
          >
            <Button
              size="small"
              onClick={prevWeek}
              startIcon={<ChevronLeftRounded />}
              variant="outlined"
              fullWidth={isMobile}
            >
              PREVIOUS WEEK
            </Button>

            <Chip
              icon={<CalendarMonthRounded />}
              label={`${weekStart.format("MM/DD")} - ${weekEnd.format(
                "MM/DD"
              )}`}
              variant="filled"
              sx={{
                bgcolor: "action.hover",
                alignSelf: "center",
                fontSize: isMobile ? "0.75rem" : "inherit",
              }}
            />

            <Button
              size="small"
              onClick={nextWeek}
              endIcon={<ChevronRightRounded />}
              variant="outlined"
              fullWidth={isMobile}
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

        {loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && !error && days.length === 0 && (
          <Alert severity="info">No sessions in this week.</Alert>
        )}

        {/* ----------------------------- */}
        {/* Render each day bucket */}
        {/* ----------------------------- */}
        {!loading &&
          !error &&
          days.map((bucket) => (
            <Paper
              key={+bucket.date}
              variant="outlined"
              sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  opacity: 0.75,
                }}
              >
                <Typography fontWeight={700}>
                  {DOW_LABELS[moment(bucket.date).day()]},{" "}
                  {moment(bucket.date).format("MM/DD/YYYY")}
                </Typography>
              </Box>

              {/* 🧭 Desktop View */}
              {!isMobile ? (
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": { bgcolor: "action.hover", fontWeight: 700 },
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
                      const start = moment(occ.startLocal);
                      const end = moment(occ.endLocal);
                      const range = `${start.format("HH:mm")} - ${end.format(
                        "HH:mm"
                      )}`;

                      // 🆕 חישוב זמינות מתוקן
                      const capacity = occ.availability?.capacity ?? 0;
                      const booked = occ.availability?.booked ?? 0;
                      const remaining = Math.max(capacity - booked, 0);
                      const isFull = remaining <= 0;

                      return (
                        <TableRow key={occ._id}>
                          <TableCell>{range}</TableCell>
                          <TableCell>{workshop.title}</TableCell>
                          <TableCell>{occ.studio}</TableCell>

                          <TableCell align="right">
                            <Stack direction="column" alignItems="flex-end">
                              <BookButton
                                type="workshop"
                                item={workshop}
                                selectedDate={occ.startLocal}
                                price={workshop.price}
                                sessionId={occ._id}
                                ruleId={occ.ruleId}
                                disabled={isFull}
                              />

                              <Typography
                                variant="caption"
                                align="left"
                                sx={{
                                  color: isFull ? "text.main" : "text.main",
                                  textAlign: "left",
                                  fontWeight: 200,
                                  mt: 0.5,
                                  display: "block",
                                }}
                              >
                                {isFull ? (
                                  <strong>Fully Booked</strong>
                                ) : (
                                  <Box
                                    sx={{
                                      mr: 0.5,
                                    }}
                                  >
                                    <strong style={{ fontWeight: 800 }}>
                                      {remaining}
                                    </strong>
                                    {"   "}

                                    <span>spots left</span>
                                  </Box>
                                )}
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                /* 📱 Mobile View */
                <Stack spacing={1.5} sx={{ p: 2 }}>
                  {bucket.items.map((occ) => {
                    const start = moment(occ.startLocal);
                    const end = moment(occ.endLocal);
                    const range = `${start.format("HH:mm")} - ${end.format(
                      "HH:mm"
                    )}`;

                    const capacity = occ.availability?.capacity ?? 0;
                    const booked = occ.availability?.booked ?? 0;
                    const remaining = Math.max(capacity - booked, 0);
                    const isFull = remaining <= 0;

                    return (
                      <Card
                        key={occ._id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          boxShadow: "none",
                          borderColor: "divider",
                        }}
                      >
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            gutterBottom
                          >
                            {range}
                          </Typography>

                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>{workshop.title}</strong>
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Studio: {occ.studio}
                          </Typography>

                          <Divider sx={{ mb: 1 }} />

                          <Typography
                            variant="caption"
                            component="span"
                            sx={{
                              color: isFull ? "error.main" : "success.main",
                              fontWeight: 600,
                              display: "block",
                              mb: 1,
                            }}
                          >
                            {isFull
                              ? "Fully Booked"
                              : `${remaining} spots left`}
                          </Typography>

                          <BookButton
                            type="workshop"
                            item={workshop}
                            selectedDate={occ.startLocal}
                            price={workshop.price}
                            sessionId={occ._id}
                            ruleId={occ.ruleId}
                            disabled={isFull}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          ))}
      </DialogContent>
    </Dialog>
  );
}

// 📁 src/components/booking/WorkshopDatePickerInline.jsx
import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useCategories } from "../../context/CategoriesContext";
import moment from "moment";

/* ------------------------
   Helpers
------------------------- */

// מחזיר YYYY-MM-DD מתאריך
const toIso = (date) => moment(date).format("YYYY-MM-DD");

// מחזיר YYYY-MM-DD מאובייקט או מחרוזת
const normalizeDate = (val) => moment(val).startOf("day").format("YYYY-MM-DD");

// האם יום מסוים עבר
const isPastDay = (iso) => iso < moment().startOf("day").format("YYYY-MM-DD");

/* ------------------------
   Component
------------------------- */

export default function WorkshopDatePickerInline({
  sessions = [],
  guestSchedule = [],
  sessionDate,
  onSelectDate,
}) {
  const { categories } = useCategories();

  // המקור: או sessions או guestSchedule
  const items = sessions.length ? sessions : guestSchedule;

  /* ------------------------
     Map: date → sessions
  ------------------------- */
  const sessionsByDate = React.useMemo(() => {
    const map = {};

    items.forEach((s) => {
      const d = moment(s.startLocal);
      if (!d.isValid()) return;

      const iso = d.format("YYYY-MM-DD");
      const color =
        categories.find((c) => c._id === s.categoryId)?.color || "#b8a798";

      if (!map[iso]) map[iso] = [];
      map[iso].push({ ...s, color });
    });

    return map;
  }, [items, categories]);

  /* ------------------------
     Picked date → preload sessions
  ------------------------- */
  const [sessionsForDay, setSessionsForDay] = React.useState([]);
  const [activeSessionId, setActiveSessionId] = React.useState(null);

  React.useEffect(() => {
    if (!sessionDate) return;

    const iso = normalizeDate(sessionDate);

    if (sessionsByDate[iso]) {
      setSessionsForDay(sessionsByDate[iso]);
    }
  }, [sessionDate, sessionsByDate]);

  /* ------------------------
     Build list of month days
  ------------------------- */
  const daysOfMonth = React.useMemo(() => {
    const base = sessionDate ? moment(sessionDate) : moment();
    const y = base.year();
    const m = base.month();
    const total = moment({ year: y, month: m }).daysInMonth();

    return Array.from({ length: total }, (_, i) =>
      moment({ year: y, month: m, day: i + 1 }).format("YYYY-MM-DD")
    );
  }, [sessionDate]);

  /* ------------------------
     Click handlers
  ------------------------- */

  const handleSelectDay = (iso) => {
    const daySessions = sessionsByDate[iso] || [];
    setSessionsForDay(daySessions);
    setActiveSessionId(null);
    onSelectDate?.(iso, null, null);
  };

  const handleSelectSession = (iso, s) => {
    setActiveSessionId(s._id);
    onSelectDate?.(iso, s._id, s);
  };

  /* ------------------------
     Render
  ------------------------- */

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Select a date:
      </Typography>

      {/* Days */}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {daysOfMonth.map((iso) => {
          const dayNum = iso.slice(-2);
          const list = sessionsByDate[iso];
          const has = !!list?.length;
          const past = isPastDay(iso);
          const active = sessionDate && normalizeDate(sessionDate) === iso;

          const color = has ? list[0].color : "#ccc";

          return (
            <Button
              key={iso}
              disabled={!has || past}
              variant={active ? "contained" : has ? "outlined" : "text"}
              onClick={() => !past && has && handleSelectDay(iso)}
              sx={{
                borderWidth: 2,
                minWidth: 44,
                minHeight: 44,
                borderColor: has ? color : "transparent",
                bgcolor: !has
                  ? "rgba(0,0,0,0.08)"
                  : past
                  ? "rgba(0,0,0,0.05)"
                  : active
                  ? color
                  : "transparent",
                color:
                  !has || past
                    ? "rgba(0,0,0,0.32)"
                    : active
                    ? "#fff"
                    : "primary.main",
              }}
            >
              {dayNum}
            </Button>
          );
        })}
      </Stack>

      {/* Time slots */}
      {sessionsForDay.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Select a time:
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {sessionsForDay.map((s) => {
              const iso = normalizeDate(s.startLocal);
              const label = moment(s.startLocal).format("HH:mm");
              const active = activeSessionId === s._id;

              return (
                <Button
                  key={s._id}
                  variant={active ? "contained" : "outlined"}
                  onClick={() => handleSelectSession(iso, s)}
                  sx={{
                    borderColor: s.color,

                    bgcolor: active ? s.color : "transparent",
                    color: active ? "#fff" : "inherit",
                  }}
                >
                  {label} — {s.studio || "Studio"}
                </Button>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

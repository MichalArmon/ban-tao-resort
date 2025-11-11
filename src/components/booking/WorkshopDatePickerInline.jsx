import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useCategories } from "../../context/CategoriesContext";

/** כלי עזר: תאריך YYYY-MM-DD ללא השפעת time-zone */
function isoLocal(y, m /*0-11*/, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}
function toIsoLocalFromDate(dateObj) {
  return isoLocal(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
}

/**
 * WorkshopDatePickerInline
 */
export default function WorkshopDatePickerInline({
  sessions,
  guestSchedule = [],
  sessionDate,
  onSelectDate,
}) {
  const { categories } = useCategories();

  const sourceList =
    Array.isArray(sessions) && sessions.length > 0
      ? sessions
      : Array.isArray(guestSchedule)
      ? guestSchedule
      : [];

  const [sessionsForDay, setSessionsForDay] = React.useState([]);
  const [activeSessionId, setActiveSessionId] = React.useState(null);

  /** מיפוי תאריך ← רשימת סשנים */
  const sessionsByDate = React.useMemo(() => {
    const map = {};
    for (const s of sourceList) {
      const dt = s.start ? new Date(s.start) : s.date ? new Date(s.date) : null;
      if (!dt || isNaN(dt)) continue;
      const iso = toIsoLocalFromDate(dt);
      const catColor =
        categories.find((c) => c._id === s.categoryId)?.color || "#b8a798ff";
      const entry = { ...s, color: catColor, _id: s._id };
      if (!map[iso]) map[iso] = [entry];
      else map[iso].push(entry);
    }
    return map;
  }, [sourceList, categories]);

  /** ✅ אם יש תאריך נבחר מבחוץ (למשל מהצ’קאאוט), נטען אותו כברירת מחדל */
  React.useEffect(() => {
    if (!sessionDate) return;
    const onlyDate = sessionDate.slice(0, 10);
    if (sessionsByDate[onlyDate]) {
      setSessionsForDay(sessionsByDate[onlyDate]);
    }
  }, [sessionDate, sessionsByDate]);

  /** כל ימי החודש הנוכחי */
  const daysOfMonth = React.useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const totalDays = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: totalDays }, (_, i) => isoLocal(y, m, i + 1));
  }, []);

  /** בחירת יום */
  const handleDateSelect = (iso) => {
    const daySessions = sessionsByDate[iso] || [];
    setSessionsForDay(daySessions);
    setActiveSessionId(null);
    onSelectDate?.(iso, null, null);
  };

  /** בחירת שעה */
  const handleSessionSelect = (dateIso, s) => {
    setActiveSessionId(s._id);
    onSelectDate?.(dateIso, s._id, s);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Select a date:
      </Typography>

      {/* תאריכים */}
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {daysOfMonth.map((iso) => {
          const dayNum = Number(iso.slice(-2));
          const hasSessions = !!sessionsByDate[iso]?.length;
          const isActive = sessionDate?.startsWith(iso);
          const color = hasSessions
            ? sessionsByDate[iso][0]?.color || "#1976d2"
            : "#ccc";

          // ✅ חדש: חסימת ימים שעברו
          const todayIso = toIsoLocalFromDate(new Date());
          const isPast = iso < todayIso;

          return (
            <Button
              key={iso}
              variant={
                isActive ? "contained" : hasSessions ? "outlined" : "text"
              }
              onClick={() => hasSessions && !isPast && handleDateSelect(iso)}
              disabled={!hasSessions || isPast}
              sx={{
                minWidth: 44,
                minHeight: 44,
                bgcolor: !hasSessions
                  ? "rgba(0,0,0,0.08)"
                  : isPast
                  ? "rgba(0,0,0,0.05)" // אפור לימים ישנים
                  : isActive
                  ? color
                  : "transparent",
                borderColor: hasSessions ? color : "transparent",
                color:
                  !hasSessions || isPast
                    ? "rgba(0,0,0,0.32)"
                    : isActive
                    ? "#fff"
                    : "inherit",
                "&:hover": {
                  bgcolor:
                    hasSessions && !isPast
                      ? isActive
                        ? color
                        : "rgba(0,0,0,0.05)"
                      : "rgba(0,0,0,0.08)",
                },
              }}
            >
              {dayNum}
            </Button>
          );
        })}
      </Stack>

      {/* שעות */}
      {sessionsForDay.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Select a time:
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {sessionsForDay.map((s) => {
              const tz = s.tz || "Asia/Bangkok";
              const timeLabel = new Date(s.start).toLocaleTimeString("he-IL", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: tz,
              });
              const isSelected = activeSessionId === s._id;

              return (
                <Button
                  key={s._id}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() =>
                    handleSessionSelect(
                      toIsoLocalFromDate(new Date(s.start)),
                      s
                    )
                  }
                  sx={{
                    borderColor: s.color,
                    bgcolor: isSelected ? s.color : "transparent",
                    color: isSelected ? "#fff" : "inherit",
                    "&:hover": {
                      bgcolor: isSelected ? s.color : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {timeLabel} — {s.studio || "Studio"}
                </Button>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

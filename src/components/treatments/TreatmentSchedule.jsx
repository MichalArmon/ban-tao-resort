import React, { useEffect } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import moment from "moment";
import { useTreatmentSessions } from "../../context/TreatmentSessionsContext";

export default function TreatmentSchedule({ treatmentId }) {
  const {
    START_HOUR,
    END_HOUR,
    weekDays,
    loading,
    sessionMap,
    bookingLoading,
    loadSessions,
    bookSession,
    nextWeek,
    prevWeek,
  } = useTreatmentSessions();

  useEffect(() => {
    loadSessions(treatmentId);
  }, [treatmentId]);
  console.log({ START_HOUR, END_HOUR, weekDays, sessionMap });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button onClick={prevWeek}>שבוע קודם</Button>
        <Typography variant="h6">לו״ז טיפולים</Typography>
        <Button onClick={nextWeek}>שבוע הבא</Button>
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={`120px repeat(${weekDays.length}, 1fr)`}
        sx={{ minWidth: 800, border: "1px solid #eee" }}
      >
        {/* ימים */}
        <Box />
        {weekDays.map((d, idx) => (
          <Box key={idx} textAlign="center" py={1} fontWeight={600}>
            {d.format("dddd")}
            <br />
            {d.format("DD/MM")}
          </Box>
        ))}

        {/* שעות */}
        {Array.from({ length: END_HOUR - START_HOUR + 1 }).map(
          (_, rowIndex) => {
            const hour = START_HOUR + rowIndex;

            return (
              <React.Fragment key={hour}>
                {/* עמודת שעה */}
                <Box textAlign="center" py={1} borderTop="1px solid #eee">
                  {hour.toString().padStart(2, "0")}:00
                </Box>

                {/* תאי ימים */}
                {weekDays.map((d, idx) => {
                  const key = `${d.format("YYYY-MM-DD")}-${hour}`;
                  const s = sessionMap[key];

                  const available = s && !s.isBooked;
                  const bg = !s ? "#fff" : available ? "#e8f5e9" : "#eeeeee";

                  return (
                    <Box
                      key={idx}
                      textAlign="center"
                      py={1}
                      borderTop="1px solid #eee"
                      sx={{
                        cursor: available ? "pointer" : "default",
                        bgcolor: bg,
                        "&:hover": available ? { opacity: 0.8 } : {},
                      }}
                      onClick={() => available && bookSession(s._id)}
                    >
                      {bookingLoading === s?._id ? (
                        <CircularProgress size={18} />
                      ) : s ? (
                        available ? (
                          "פנוי"
                        ) : (
                          "תפוס"
                        )
                      ) : (
                        ""
                      )}
                    </Box>
                  );
                })}
              </React.Fragment>
            );
          }
        )}
      </Box>

      {loading && (
        <Box textAlign="center" py={2}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

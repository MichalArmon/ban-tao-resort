import React, { useEffect } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import moment from "moment";
import { useTreatmentSessions } from "../../context/TreatmentSessionsContext";
import BookTreatmentButton from "../booking/bookingButtons/BookTreatmentButton";

export default function TreatmentSchedule({ treatmentId }) {
  const {
    START_HOUR,
    END_HOUR,
    weekDays,
    loading,
    sessionMap,
    loadSessions,
    nextWeek,
    prevWeek,
  } = useTreatmentSessions();

  useEffect(() => {
    if (treatmentId) {
      loadSessions(treatmentId);
    }
  }, [treatmentId]);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Button onClick={prevWeek}>שבוע קודם</Button>
        <Typography variant="h6">לו״ז טיפולים</Typography>
        <Button onClick={nextWeek}>שבוע הבא</Button>
      </Box>

      {/* Schedule Grid */}
      <Box
        display="grid"
        gridTemplateColumns={`120px repeat(${weekDays.length}, 1fr)`}
        sx={{ minWidth: 800, border: "1px solid #eee" }}
      >
        {/* Days row */}
        <Box />
        {weekDays.map((d, idx) => (
          <Box key={idx} textAlign="center" py={1} fontWeight={600}>
            {d.format("dddd")}
            <br />
            {d.format("DD/MM")}
          </Box>
        ))}

        {/* Hours rows */}
        {Array.from({ length: END_HOUR - START_HOUR + 1 }).map(
          (_, rowIndex) => {
            const hour = START_HOUR + rowIndex;

            return (
              <React.Fragment key={hour}>
                {/* Hour column */}
                <Box textAlign="center" py={1} borderTop="1px solid #eee">
                  {hour.toString().padStart(2, "0")}:00
                </Box>

                {/* Day cells */}
                {weekDays.map((d, idx) => {
                  const dateStr = d.format("YYYY-MM-DD");
                  const key = `${dateStr}-${hour}`;
                  const session = sessionMap[key];

                  const available = session && !session.isBooked;
                  const bg = !session
                    ? "#fff"
                    : available
                    ? "#e8f5e9"
                    : "#eeeeee";

                  return (
                    <Box
                      key={idx}
                      textAlign="center"
                      py={1}
                      borderTop="1px solid #eee"
                      sx={{ bgcolor: bg }}
                    >
                      {session ? (
                        available ? (
                          <BookTreatmentButton
                            session={session}
                            date={dateStr}
                            hour={hour}
                          />
                        ) : (
                          <Typography variant="caption">תפוס</Typography>
                        )
                      ) : null}
                    </Box>
                  );
                })}
              </React.Fragment>
            );
          }
        )}
      </Box>

      {/* Loader */}
      {loading && (
        <Box textAlign="center" py={2}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

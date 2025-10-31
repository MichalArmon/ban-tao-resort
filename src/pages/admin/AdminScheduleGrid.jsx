// 📁 src/pages/admin/AdminScheduleGrid.jsx
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { useWorkshops } from "../../context/WorkshopsContext";
import { useSchedule } from "../../context/ScheduleContext";

// מפתחות ימים: חייב להתאים ל-DAY_MAP ב-scheduleController.js
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// 🎯 Hours with half-hour slots
const HOURS_START = 7;
const HOURS_END = 23;
const HOURS = [];
for (let h = HOURS_START; h <= HOURS_END; h++) {
  const paddedHour = String(h).padStart(2, "0");
  HOURS.push(`${paddedHour}:00`);
  if (h < HOURS_END) {
    HOURS.push(`${paddedHour}:30`);
  }
}
// נניח שמות סטודיואים כפי שהם נשמרים ב-Grid בשרת
const STUDIOS = [
  { key: "Studio A", label: "Studio A" },
  { key: "Studio B", label: "Studio B" },
];

export default function AdminScheduleGrid() {
  const {
    items: workshops,
    // 🎯 תיקון: משתמשים ב-Alias listWorkshops: loadWorkshops כדי להתאים לקוד הקיים
    listWorkshops: loadWorkshops,
    loading: loadingWorkshops,
    error: errorWorkshops,
  } = useWorkshops();

  const {
    grid,
    setGrid,
    loadSchedule,
    saveSchedule,
    saveCell,
    loading,
    saving,
    error: errorSchedule,
  } = useSchedule();

  /* ---------- Loads Workshops and Schedule on mount ---------- */

  useEffect(() => {
    loadWorkshops(); // ⬅️ קורא כעת לפונקציה listWorkshops (שמותקנת)
    loadSchedule();
  }, [loadWorkshops, loadSchedule]);

  /* ---------- Local change + Server update (Single Cell) ---------- */

  const handleChange = (day, hour, studioKey, value) => {
    // עדכון מקומי
    setGrid((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || {}),
        [hour]: {
          ...(prev[day]?.[hour] || {}),
          [studioKey]: value, // value כאן הוא ה-ID (או ריק)
        },
      },
    }));
    // שליחה לשרת (שומר ID)
    saveCell(day, hour, studioKey, value);
  };

  /* ---------- Save All (Optional) ---------- */

  const handleSaveAll = async () => {
    await saveSchedule(grid);
    alert("✅ Schedule saved successfully!");
  };

  /* ---------- Clear Manual Grid (Delete) ---------- */
  const handleClearGrid = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the entire manual schedule? This will reset it to the Recurring Rules base."
      )
    ) {
      // נשתמש ב-saveSchedule כדי לשלוח Grid ריק ולדרוס את הקיים.
      saveSchedule({});
    }
  };

  /* ---------- Loading States ---------- */

  if (loading || loadingWorkshops) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 1 }}>Loading schedule...</Typography>
      </Box>
    );
  }

  /* ---------- Error States ---------- */

  if (errorWorkshops || errorSchedule) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {errorWorkshops || errorSchedule || "Failed to load data"}
        </Alert>
      </Box>
    );
  }

  /* ---------- Main Table Render ---------- */

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Weekly Schedule Editor (Override Grid)
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Use this grid to **override** the default schedule derived from
        Recurring Rules. Changes are saved instantly per cell.
        {saving && <CircularProgress size={16} sx={{ ml: 2 }} />}
      </Typography>

      <Box
        component="table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          "& th, & td": {
            border: "1px solid #ccc",
            textAlign: "center",
            padding: "6px",
            verticalAlign: "top",
            minWidth: 100,
          },
          "& th": {
            backgroundColor: "#f0f0f0",
            fontWeight: 700,
          },
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 70 }}>Time</th>
            {DAYS.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr key={hour}>
              <td style={{ fontSize: 13, fontWeight: 600 }}>{hour}</td>
              {DAYS.map((day) => (
                <td key={day}>
                  {STUDIOS.map((studio) => (
                    <TextField
                      key={studio.key}
                      select
                      size="small"
                      label={studio.label}
                      fullWidth
                      sx={{ mb: 0.5 }}
                      value={grid[day]?.[hour]?.[studio.key] || ""}
                      onChange={(e) =>
                        handleChange(day, hour, studio.key, e.target.value)
                      }
                    >
                      <MenuItem value="">— none —</MenuItem>
                      {workshops.map((w) => (
                        <MenuItem key={w._id} value={w._id}>
                          {w.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          onClick={handleSaveAll}
          variant="contained"
          color="primary"
          disabled={saving}
        >
          {saving ? "Saving All..." : "Save All (Optional)"}
        </Button>
        <Button onClick={handleClearGrid} variant="outlined" color="error">
          Clear Manual Grid
        </Button>
      </Stack>
    </Box>
  );
}

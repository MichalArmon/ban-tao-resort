import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Box,
  Typography,
} from "@mui/material";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";

import { useBirthChart } from "../context/BirthChartContext";
import { useUser } from "../context/UserContext";
import { put, get } from "../config/api";

export default function AstroProfileDialog() {
  const { profileOpen, setProfileOpen, showChart } = useBirthChart();
  const { token } = useUser();

  const [form, setForm] = useState({
    birthDate: "1990-06-15",
    birthTime: "10:30",
    birthPlace: "Tel Aviv, Israel",
    lat: "32.0853",
    lon: "34.7818",
    tzone: "3",
  });

  const handleChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📌 handleSubmit STARTED");
    console.log("📌 form data:", form);

    try {
      console.log("📌 Sending PUT /users/me/astro-profile...");
      const saveRes = await put("/users/me/astro-profile", form, token);
      console.log("✅ Profile saved:", saveRes);

      console.log("📌 Sending GET /astro/birth-chart...");
      const chartRes = await get("/astro/birth-chart", token);

      console.log("📌 Response from backend:", chartRes);

      // 🎯 CHECK svgUrl INSTEAD OF svg
      if (chartRes?.svgUrl) {
        console.log("🎉 SVG URL RECEIVED! Opening chart dialog...");
        showChart(chartRes.svgUrl);
      } else {
        console.warn("⚠️ No SVG URL returned from API");
      }

      setProfileOpen(false);
    } catch (err) {
      console.error("❌ Astro profile update failed:", err);
    }
  };

  return (
    <Dialog
      sx={{ mt: 5 }}
      open={profileOpen}
      onClose={() => setProfileOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <StarsRoundedIcon sx={{ color: "#FF4FA3" }} />
          <Typography variant="h6">Create Your Birth Chart Profile</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Birth Date"
              type="date"
              value={form.birthDate}
              onChange={handleChange("birthDate")}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Birth Time"
              type="time"
              value={form.birthTime}
              onChange={handleChange("birthTime")}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Birth Place"
              placeholder="e.g., Tel Aviv, Israel"
              value={form.birthPlace}
              onChange={handleChange("birthPlace")}
              required
            />

            <TextField
              label="Latitude"
              placeholder="32.0853"
              value={form.lat}
              onChange={handleChange("lat")}
              required
            />

            <TextField
              label="Longitude"
              placeholder="34.7818"
              value={form.lon}
              onChange={handleChange("lon")}
              required
            />

            <TextField
              label="Timezone Offset"
              placeholder="e.g., 3"
              value={form.tzone}
              onChange={handleChange("tzone")}
              required
            />

            <Button type="submit" variant="contained" fullWidth>
              Generate Birth Chart
            </Button>
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setProfileOpen(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

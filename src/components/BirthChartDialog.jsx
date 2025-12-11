// BirthChartDialog.jsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useBirthChart } from "../context/BirthChartContext";

export default function BirthChartDialog() {
  const { chartSvg, chartOpen, hideChart } = useBirthChart();

  console.log("📌 BirthChartDialog RENDER", { chartOpen, chartSvg });

  // אם אין שום ערך — לא מציגים כלום
  if (!chartSvg) return null;

  // בדיקה: האם זה URL או קוד SVG?
  const isUrl = typeof chartSvg === "string" && chartSvg.startsWith("http");

  return (
    <Dialog open={chartOpen} onClose={hideChart} maxWidth="md" fullWidth>
      <DialogTitle sx={{ mb: 0, pb: 0 }}>
        Astrological Wheel Chart
        <IconButton
          onClick={hideChart}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {isUrl ? (
          <img
            src={chartSvg}
            alt="Birth Chart"
            style={{
              width: "100%",
              height: "auto",
              maxWidth: "600px",
              margin: "0 auto",
              padding: "0",
            }}
          />
        ) : (
          <div
            dangerouslySetInnerHTML={{ __html: chartSvg }}
            style={{ width: "100%", height: "auto" }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

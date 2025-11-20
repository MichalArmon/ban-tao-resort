import React from "react";
import { Stack, Typography } from "@mui/material";

export default function SummaryRow({ icon, label, value }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

import React from "react";
import { Box, IconButton, Typography, Stack } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import HistoryRoundedIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // 👈 מניח שיש לך קונטקסט כזה

export default function UserBar() {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // נשלוף את המשתמש המחובר

  // נציג רק אם המשתמש קיים והתפקיד שלו הוא guest
  if (!currentUser || currentUser.role !== "guest") return null;

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "rgba(255,255,255,0.9)",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        py: 0.5,
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* צד שמאל - מועדפים והזמנות קודמות */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" onClick={() => navigate("/favorites")}>
          <FavoriteBorderRoundedIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/reservations")}
        >
          הזמנות קודמות
        </Typography>
      </Stack>

      {/* צד ימין - פרופיל */}
      <IconButton size="small" onClick={() => navigate("/account")}>
        <AccountCircleRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

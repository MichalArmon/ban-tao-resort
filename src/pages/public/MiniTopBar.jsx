import React from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import StarRounded from "@mui/icons-material/StarRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import PersonAddAlt1Rounded from "@mui/icons-material/PersonAddAlt1Rounded";

import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useBirthChart } from "../../context/BirthChartContext";

import LoginDialog from "../../components/auth/LoginDialog";
import SignupDialog from "../../components/auth/SignupDialog";
import AstroProfileDialog from "../../components/AstroProfileDialog"; // ← להוסיף IMPORT אם לא היה

export default function MiniTopBar() {
  const navigate = useNavigate();

  const { user, logout } = useUser();
  const { setProfileOpen } = useBirthChart();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openSignup, setOpenSignup] = React.useState(false);

  const toggleMenu = (e) => {
    if (anchorEl) setAnchorEl(null);
    else setAnchorEl(e.currentTarget);
  };

  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <Box
        position="fixed"
        sx={{
          width: "100%",
          height: 38,
          bgcolor: "background.default",
          borderBottom: "1px solid #ddd",
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1301,
        }}
      >
        {/* LEFT – SEARCH */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SearchIcon fontSize="small" />
          <TextField
            placeholder="Search..."
            variant="standard"
            InputProps={{
              disableUnderline: true,
              sx: { fontSize: 14 },
            }}
            sx={{ width: 150 }}
          />
        </Box>

        {/* RIGHT – WELCOME + CHART BUTTON + USER ICON */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Birth Chart button
          {user && (
            <Box
              onClick={() => setProfileOpen(true)}
              sx={{
                ml: 1,
                px: 1.2,
                py: 0.3,
                fontSize: "12px",
                borderRadius: "20px",
                border: "1px solid #FF4FA3",
                color: "#FF4FA3",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  bgcolor: "#FF4FA3",
                  color: "white",
                },
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              Generate Birth Chart
            </Box>
          )} */}

          {/* Welcome Message */}
          {user && (
            <Typography sx={{ fontSize: 13 }}>
              Welcome, {user.name.first || "Guest"}
            </Typography>
          )}

          {/* USER MENU ICON */}
          <IconButton
            onClick={toggleMenu}
            sx={{
              color: user ? "#000" : "#999",
              transition: "0.2s",
            }}
          >
            <AccountCircleIcon />
          </IconButton>
        </Box>

        {/* MENU */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
          {!user && (
            <>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  setOpenLogin(true);
                }}
              >
                <LoginRounded sx={{ mr: 1, fontSize: 20 }} />
                Login
              </MenuItem>

              <MenuItem
                onClick={() => {
                  closeMenu();
                  setOpenSignup(true);
                }}
              >
                <PersonAddAlt1Rounded sx={{ mr: 1, fontSize: 20 }} />
                Sign Up
              </MenuItem>
            </>
          )}

          {user && (
            <>
              <MenuItem
                onClick={() => {
                  closeMenu();
                  navigate("/resort/guest/favorites");
                }}
              >
                <StarRounded sx={{ mr: 1 }} />
                Favorites
              </MenuItem>

              <MenuItem onClick={closeMenu}>
                <HistoryRounded sx={{ mr: 1 }} />
                Old Bookings
              </MenuItem>

              <MenuItem
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                <LogoutRounded sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </>
          )}
        </Menu>
      </Box>

      {/* LOGIN */}
      <LoginDialog
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        onOpenSignup={() => {
          setOpenLogin(false);
          setOpenSignup(true);
        }}
      />

      {/* SIGNUP */}
      <SignupDialog open={openSignup} onClose={() => setOpenSignup(false)} />

      {/* ⭐⭐ HERE – הדיאלוג של הפרופיל האסטרולוגי ⭐⭐ */}
      <AstroProfileDialog />
    </>
  );
}

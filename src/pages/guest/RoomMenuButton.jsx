import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import { Link as RouterLink } from "react-router-dom";
import useRoomsConfig from "../../hooks/useRoomsConfig";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";

// ✅ פונקציה חיונית: ממירה מחרוזת ל-slug
const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");

export default function RoomsMenuButton() {
  const { rooms, loading, error } = useRoomsConfig();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <Button
        id="rooms-button"
        aria-controls={open ? "rooms-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        color="inherit"
        sx={{
          textTransform: "none",
          // ✅ 1. ביטול מוחלט של הריפוד האופקי בכפתור כולו
          px: 0,
          minWidth: "auto",
          fontSize: 16,

          // ✅ 2. דריסת המרווח של עוטף האייקון
          "& .MuiButton-endIcon": {
            marginLeft: "3px", // מבטל את המרווח האוטומטי
            marginRight: "0px", // מושך את האייקון אחורה (שנה את -4px אם צריך)
          },

          // ✅ 3. ניקוי המרווחים הפנימיים מהתווית (Text label)
          "& .MuiButton-label": {
            margin: "0px",
          },
        }}
        endIcon={open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        disabled={error}
      >
        Rooms
      </Button>

      <Menu
        id="rooms-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        keepMounted
        MenuListProps={{ "aria-labelledby": "rooms-button" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              bgcolor: "background.paper",
              borderRadius: 0,
              boxShadow: 3,
              border: "1px solid",
              borderColor: "divider",
              minWidth: 220,
            },
            elevation: 0,
          },
        }}
      >
        {/* מציג טעינה */}
        {loading && (
          <MenuItem disabled sx={{ opacity: 0.7, justifyContent: "center" }}>
            <Box py={0.5}>
              <CircularProgress size={20} />
            </Box>
          </MenuItem>
        )}
        {/* מציג שגיאה */}
        {error && !loading && (
          <MenuItem disabled sx={{ color: "error.main", opacity: 1 }}>
            Failed to load rooms
          </MenuItem>
        )}
        {/* מציג את החדרים רק אם יש מפתחות באובייקט */}
        {Object.keys(rooms).length > 0 &&
          Object.entries(rooms).map(([key, data]) => (
            <MenuItem
              key={key}
              component={RouterLink}
              to={`/resort/guest/rooms/${slugify(key)}`}
              onClick={handleClose}
              sx={{
                fontWeight: 500,
                "&:hover": {
                  textDecoration: "underline",
                  textDecorationThickness: "2px",
                  textUnderlineOffset: "4px",
                  backgroundColor: "transparent",
                  color: "primary.main",
                },
                "&.Mui-focusVisible": { backgroundColor: "transparent" },
              }}
            >
              {data?.label ?? key}
            </MenuItem>
          ))}
        {/* מציג הודעה אם אין חדרים ואין שגיאה */}
        {Object.keys(rooms).length === 0 && !loading && !error && (
          <MenuItem disabled sx={{ opacity: 0.7 }}>
            No rooms defined.
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

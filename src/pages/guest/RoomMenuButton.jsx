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

// ממירה טקסט ל-slug רק כשאין slug מובנה
const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");

export default function RoomsMenuButton() {
  const { rooms, loading, error } = useRoomsConfig();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // תקנון: גם אם rooms הוא אובייקט (map) וגם אם הוא מערך
  const list = React.useMemo(() => {
    if (Array.isArray(rooms)) return rooms; // [{ label, slug, ... }]
    if (rooms && typeof rooms === "object") {
      return Object.entries(rooms).map(([key, data]) => ({
        // נפוץ אצלך: data.label וכד' נמצאים תחת המפתח
        key,
        ...data,
      }));
    }
    return [];
  }, [rooms]);

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
          px: 0,
          minWidth: "auto",
          "& .MuiButton-endIcon": {
            marginLeft: "3px",
            marginRight: 0,
          },
          "& .MuiButton-label": { margin: 0 },
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
        {loading && (
          <MenuItem disabled sx={{ opacity: 0.7, justifyContent: "center" }}>
            <Box py={0.5}>
              <CircularProgress size={20} />
            </Box>
          </MenuItem>
        )}

        {error && !loading && (
          <MenuItem disabled sx={{ color: "error.main", opacity: 1 }}>
            Failed to load rooms
          </MenuItem>
        )}

        {!loading && !error && list.length > 0 && (
          <>
            {list.map((item) => {
              const label = item?.label ?? item?.title ?? item?.key ?? "Room";
              const slug = item?.slug ?? slugify(label);
              // ✅ נתיב חדש ונכון: בלי '/resort' ובצורת יחיד 'room'
              const to = `/guest/room/${slug}`;

              return (
                <MenuItem
                  key={slug}
                  component={RouterLink}
                  to={to}
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
                  {label}
                </MenuItem>
              );
            })}
          </>
        )}

        {!loading && !error && list.length === 0 && (
          <MenuItem disabled sx={{ opacity: 0.7 }}>
            No rooms defined.
          </MenuItem>
        )}
      </Menu>
    </>
  );
}

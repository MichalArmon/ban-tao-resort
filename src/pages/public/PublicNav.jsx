import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { Instagram, WhatsApp } from "@mui/icons-material";

const pages = ["About", "Construction", "Location", "Atmosphere"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function PublicNav() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const iconStyle = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid",
    borderColor: "text.primary",
    color: "text.primary",
    bgcolor: "transparent",
    "&:hover": { bgcolor: "action.hover" },
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: "background.default", height: 80 }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 80,
            // xs = flex רגיל; md+ = grid עם 3 עמודות
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: { md: "1fr auto 1fr" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: { md: 2 },
          }}
        >
          {/* ========= מובייל ========= */}
          {/* המבורגר (xs בלבד) */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* כותרת במרכז (xs בלבד) */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#top"
              sx={{
                letterSpacing: ".18rem",
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 300,
              }}
            >
              BAN TAO
            </Typography>
          </Box>

          {/* ========= דסקטופ (md+) – 3 עמודות ========= */}
          {/* עמודה שמאל: תפריט */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              justifyContent: "flex-start",
              color: "primary.main",
            }}
          >
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* עמודה מרכז: לוגו + שם ממורכזים */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <AdbIcon sx={{ color: "primary.main" }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#top"
              sx={{
                letterSpacing: ".18rem",
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 300,
              }}
            >
              BAN TAO
            </Typography>
          </Box>

          {/* עמודה ימין: כפתור + אייקונים */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{
                px: 3,
                borderRadius: 2,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              More Info
            </Button>

            <IconButton
              component="a"
              href="https://wa.me/15551234567"
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp"
              sx={{
                width: 36,
                height: 36,

                color: "primary.main",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <WhatsApp fontSize="small" />
            </IconButton>

            <IconButton
              component="a"
              href="https://instagram.com/yourprofile"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              sx={{
                width: 36,
                height: 36,

                color: "primary.main",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Instagram fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>

        {/* תפריט המבורגר למובייל */}
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {pages.map((page) => (
            <MenuItem key={page} onClick={handleCloseNavMenu}>
              <Typography sx={{ textAlign: "center", textTransform: "none" }}>
                {page}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Container>
    </AppBar>
  );
}

export default PublicNav;

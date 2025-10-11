// src/pages/public/PublicNav.jsx
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Instagram, WhatsApp } from "@mui/icons-material";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { pub } from "../../../utils/publicPath";
import RoomsMenuButton from "../guest/RoomMenuButton";

const PAGES_PUBLIC = ["About", "Construction", "Location", "Atmosphere"];
const PAGES_GUEST = ["Rooms", "Treatments", "Classes", "Retreats"];
const PAGES_ADMIN = ["Rooms", "Retreats", "Users", "My Booking"];

function PublicNav(props) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const { pathname } = useLocation();

  const ROOT = "/resort";
  const isGuest = pathname.startsWith("/resort/guest");
  const isAdmin = pathname.startsWith("/admin");

  const basePath = isGuest ? `${ROOT}/guest` : isAdmin ? `/admin` : ROOT;

  const slug = (s) => s.trim().toLowerCase().replace(/\s+/g, "-");
  const pages = isGuest ? PAGES_GUEST : isAdmin ? PAGES_ADMIN : PAGES_PUBLIC;

  const handleOpenNavMenu = (e) => setAnchorElNav(e.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);

  return (
    <AppBar
      {...props}
      position="fixed"
      sx={(theme) => ({
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: "background.default",
        color: "text.primary",
        justifyContent: "center",
        height: "var(--nav-h)",
      })}
    >
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, md: 5 } }}>
        <Toolbar
          disableGutters
          sx={{
            minHeight: 80,
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: { md: "1fr auto 1fr" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: { md: 2 },
          }}
        >
          {/* ========= מובייל ========= */}
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

          {/* לוגו קטן במרכז (מובייל) */}
          <Box sx={{ display: { xs: "block", md: "none" }, mr: "1px" }}>
            <HashLink to={`${ROOT}/#top`} smooth>
              <Box
                component="img"
                src={pub("logo_B.svg")}
                alt="Ban Tao"
                sx={{
                  width: 120,
                  height: "auto",
                  display: "block",
                  maxWidth: "60vw",
                  objectFit: "contain",
                  flex: "0 0 auto",
                  alignSelf: "center",
                  mr: 1,
                }}
              />
            </HashLink>
          </Box>

          {/* ========= דסקטופ (md+) ========= */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              justifyContent: "flex-start",
              color: "primary.main",
            }}
          >
            {pages.map((page) => {
              const isRoomsGuest = isGuest && page === "Rooms";
              if (isRoomsGuest) return <RoomsMenuButton key="rooms-menu" />;

              return (
                <Button
                  key={page}
                  component={RouterLink}
                  to={`${basePath}/${slug(page)}`}
                  onClick={handleCloseNavMenu}
                  color="inherit"
                  sx={{ textTransform: "none" }}
                >
                  {page}
                </Button>
              );
            })}
          </Box>

          {/* מרכז: לוגו גדול */}
          <Box
            component={HashLink}
            to={`${ROOT}/#top`}
            smooth
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Box
              component="img"
              src={pub("logo_B.svg")}
              alt="Ban Tao logo"
              sx={{ width: 150, height: 150 }}
            />
          </Box>

          {/* ימין: CTA + אייקונים */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              href="https://wa.me/972502136623"
              variant="contained"
              size="small"
              sx={{
                px: 3,
                borderRadius: 0,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              More Info
            </Button>
            <IconButton
              component="a"
              href="https://wa.me/972502136623"
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

        {/* ========= תפריט מובייל ========= */}
        <Menu
          id="menu-appbar"
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          anchorReference="anchorPosition"
          anchorPosition={{ top: 0, left: 0 }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          marginThreshold={0}
          sx={{ display: { xs: "block", md: "none" } }}
          slotProps={{
            paper: {
              sx: {
                width: "100%",
                height: "150dvh",
                maxWidth: "none",
                m: 0,
                borderRadius: 0,
                boxShadow: "none",
                position: "relative",
                bgcolor: "background.default",
                color: "text.primary",
              },
            },
            list: { sx: { p: 0 } },
          }}
        >
          {/* כפתור X */}
          <IconButton
            onClick={handleCloseNavMenu}
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              color: "primary.main",
            }}
            aria-label="Close menu"
          >
            <CloseIcon sx={{ fontSize: 32 }} />
          </IconButton>

          {/* מרכז מסך */}
          <Box
            sx={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              px: 0,
              textAlign: "center",
            }}
          >
            <Stack spacing={6} alignItems="center" sx={{ width: "100%" }}>
              {pages.map((page) => {
                // במובייל: תמיד מסתמכים על basePath כדי לשמר /resort/guest/*
                const to = `${basePath}/${slug(page)}`;

                return (
                  <MenuItem
                    key={page}
                    onClick={handleCloseNavMenu}
                    disableRipple
                    sx={{ py: 0, "&:hover": { bgcolor: "transparent" } }}
                  >
                    <Typography
                      component={RouterLink}
                      to={to}
                      sx={{
                        fontSize: 28,
                        letterSpacing: 0.5,
                        textDecoration: "none",
                        color: "text.primary",
                      }}
                    >
                      {page}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Stack>

            <Button
              variant="contained"
              sx={{
                mt: 2,
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontSize: 20,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
              href="https://wa.me/972502136623"
              target="_blank"
              rel="noopener"
            >
              More Info
            </Button>

            <Stack direction="row" spacing={6} alignItems="center" mt={2}>
              <IconButton
                sx={{ color: "primary.main" }}
                aria-label="WhatsApp"
                href="https://wa.me/972502136623"
                target="_blank"
                rel="noopener"
              >
                <WhatsApp sx={{ fontSize: 36 }} />
              </IconButton>
              <IconButton
                sx={{ color: "primary.main" }}
                aria-label="Instagram"
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener"
              >
                <Instagram sx={{ fontSize: 36 }} />
              </IconButton>
            </Stack>
          </Box>
        </Menu>
      </Container>
    </AppBar>
  );
}

export default PublicNav;

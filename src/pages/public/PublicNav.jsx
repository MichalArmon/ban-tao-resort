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
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import BanTaoLogo from "../../components/BanTaoLogo";
import { pub } from "../../../utils/publicPath";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const PAGES_PUBLIC = ["About", "Construction", "Location", "Atmosphere"];
const PAGES_GUEST = ["Rooms", "Treatments", "Classes", "Retreats"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

function PublicNav(props) {
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
  // 👇 חדש: נקבע אם אנחנו באזור /guest לפי ה-URL
  const { pathname } = useLocation();
  const isGuest = pathname.startsWith("/guest");

  // פונקציית עזר פשוטה ל-slug
  const slug = (s) => s.trim().toLowerCase();

  // 👇 זה המערך שישתנה אוטומטית
  const pages = isGuest ? PAGES_GUEST : PAGES_PUBLIC;

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
    <AppBar
      {...props}
      position="fixed"
      sx={(theme) => ({
        zIndex: theme.zIndex.drawer + 1, // מעל התוכן
        bgcolor: "background.default",
        color: "text.primary",
        height: "var(--nav-h)",
        justifyContent: "center",
      })}
    >
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, md: 5 } }}>
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

              justifyContent: "right",
              mr: "1px",
            }}
          >
            {/* לוגו קטן */}
            <HashLink to="/#top" smooth>
              <Box
                component="img"
                src={pub("logo_B.svg")}
                alt="Ban Tao"
                sx={{ width: 120, height: "auto", mr: 1 }}
              />
              {/* <AdbIcon sx={{ color: "primary.main" }} /> */}
              {/* <Typography
                component={HashLink}
                to="/#top"
                smooth
                variant="h6"
                noWrap
                sx={{
                  letterSpacing: ".18rem",
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 300,
                }}
              >
                B̂ān TAO
              </Typography> */}
            </HashLink>
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
                component={RouterLink}
                to={`/${page.toLowerCase()}`}
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
            component={HashLink}
            to="/#top"
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
            {/* <Typography
              component={HashLink}
              to="/#top"
              smooth
              variant="h6"
              noWrap
              href="#top"
              sx={{
                letterSpacing: ".18rem",
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 300,
              }}
            >
              B̂ān TAO
            </Typography> */}
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

        {/* תפריט המבורגר למובייל */}
        <Menu
          id="menu-appbar"
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          // מסך מלא מלמעלה-שמאל
          anchorReference="anchorPosition"
          anchorPosition={{ top: 0, left: 0 }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          // מבטל את רווח ה-16px של Popover
          marginThreshold={0}
          sx={{ display: { xs: "block", md: "none" } }}
          slotProps={{
            paper: {
              sx: {
                width: "100%", // לא 100% – תופס את ה-viewport
                height: "150dvh", // נכון למובייל
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
              px: 0, // בלי padding צדדי
              textAlign: "center",
            }}
          >
            <Stack spacing={6} alignItems="center" sx={{ width: "100%" }}>
              {pages.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                  disableRipple
                  sx={{ py: 0, "&:hover": { bgcolor: "transparent" } }}
                >
                  <Typography sx={{ fontSize: 28, letterSpacing: 0.5 }}>
                    {page}
                  </Typography>
                </MenuItem>
              ))}
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
            >
              More Info
            </Button>

            <Stack direction="row" spacing={6} alignItems="center" mt={2}>
              <IconButton
                sx={{ color: "primary.main" }}
                aria-label="WhatsApp"
                href="https://wa.me/972502136623"
              >
                <WhatsApp sx={{ fontSize: 36 }} />
              </IconButton>
              <IconButton sx={{ color: "primary.main" }} aria-label="Instagram">
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

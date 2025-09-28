import { Box } from "@mui/material";

function Logo() {
  return (
    <Box
      component="img"
      src="/logo.svg"
      alt="Ban Tao"
      sx={{ height: { xs: 24, md: 28 }, mr: 1 }}
    />
  );
}

export default Logo;

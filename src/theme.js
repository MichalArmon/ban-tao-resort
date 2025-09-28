import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  // direction: "rtl", // חשוב ל־RTL
  typography: {
    fontFamily: `"Wix Madefor Display", system-ui, "Segoe UI", Arial, sans-serif`,
  },
  palette: {
    primary: { main: "#7f6a58" }, // גוון “ריזורט” חמים
    secondary: { main: "#c8b6a6" },
    background: { default: "#f9f7ef" },
  },
});
theme = responsiveFontSizes(theme);
export default theme;

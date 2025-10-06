// src/theme.js
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

/* ------------------------------
   בסיס טיפוגרפי משותף
-------------------------------- */
const baseTypography = {
  fontFamily: `"Wix Madefor Display", system-ui, "Segoe UI", Arial, sans-serif`,
};

/* ------------------------------
   🎨 Resort Theme – חמים ואלגנטי
-------------------------------- */
let themeResort = createTheme({
  typography: baseTypography,
  palette: {
    primary: { main: "#7f6a58" }, // חום־זהוב טבעי
    secondary: { main: "#c8b6a6" },
    background: { default: "#f9f7ef" },
  },
});
themeResort = responsiveFontSizes(themeResort);

/* ------------------------------
   💙 Studio Theme – כחול-הייטקי נקי
-------------------------------- */
let themeStudio = createTheme({
  typography: baseTypography,
  palette: {
    primary: { main: "#2f0a45ff" }, // סגול עמוק (purple 800)
    secondary: { main: "#ba68c8" }, // סגול בהיר (purple 300)
    background: { default: "#f6f3fa" }, // רקע אפור-לבנדר רך
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
  },
});
themeStudio = responsiveFontSizes(themeStudio);

/* ------------------------------
   ייצוא
-------------------------------- */
export { themeResort, themeStudio };

// ברירת מחדל – ריזורט (אם מייבאים בלי פירוט)
export default themeResort;

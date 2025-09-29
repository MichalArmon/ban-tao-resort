// components/BanTaoLogo.jsx
import SvgIcon from "@mui/material/SvgIcon";

export default function BanTaoLogo(props) {
  return (
    <SvgIcon
      viewBox="0 0 64 64" // שימי כאן את ה-viewBox מה-SVG שלך
      titleAccess="Ban Tao"
      {...props}
    >
      {/* הדביקי כאן את ה-<path .../> מה-SVG שלך */}
      {/* דוגמה: <path d="M10 10L54 10L32 54Z" /> */}
    </SvgIcon>
  );
}

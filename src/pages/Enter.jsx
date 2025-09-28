// Enter.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";

export default function Enter() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();
  const back = loc.state?.from?.pathname + (loc.state?.from?.search || "");

  async function handleEnter() {
    // כאן עושים אימות אמיתי (OTP/מייל/סיסמה/בדיקת הזמנה)
    await login({ id: "u1", role: "guest" });
    nav(back || "/guest", { replace: true });
  }

  return (
    <>
      <title>Enter — Ban Tao</title>
      <button onClick={handleEnter}>Enter</button>
    </>
  );
}

// AdminLogin.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth.jsx";

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();

  async function handleAdminLogin() {
    // אימות אמיתי מול ה-API ואז:
    await login({ id: "admin1", role: "admin" });
    nav("/admin", { replace: true });
  }

  return (
    <>
      <title>Admin Login — Ban Tao</title>
      <meta name="robots" content="noindex,nofollow" />
      <button onClick={handleAdminLogin}>Admin Enter</button>
    </>
  );
}

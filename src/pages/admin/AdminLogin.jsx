import { useState } from "react";
import { useUser } from "../../context/UserContext";

export default function AdminLogin() {
  const { login } = useUser(); // ⬅️ משתמשים בקונטקסט החדש
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // ⬅️ login מחזיר user
      window.location.href = "/admin"; // ⬅️ נכנסים לדשבורד
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "0 auto" }}>
      <h2>Admin Login</h2>

      {error && (
        <p style={{ color: "red", fontWeight: "bold", marginTop: 10 }}>
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          placeholder="Email"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10 }}
        />

        <button style={{ padding: 10, fontWeight: 600 }}>Login</button>
      </form>
    </div>
  );
}

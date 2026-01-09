import React, { useState } from "react";
import { login } from "../api";
import { setAuth } from "../auth";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      setAuth(data.token, data.user);
      onLogin?.(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={submit} className="form">
        <div className="form-row">
          <div className="label">Email</div>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="form-row">
          <div className="label">Password</div>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <div className="auth-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </div>
      </form>

      {error && <div className="empty">{error}</div>}
    </div>
  );
}

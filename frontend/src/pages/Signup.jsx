import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../api";
import { setAuth } from "../auth";

export default function Signup({ role, onSignup }) {
  const fixedRole = role;
  const [selectedRole, setSelectedRole] = useState(role || "user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await signup({
        name,
        email,
        password,
        role: selectedRole,
        adminSecret,
      });
      setAuth(data.token, data.user);
      onSignup?.(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = selectedRole === "admin";

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h2 className="auth-title">
          {isAdmin ? "Admin Signup" : "Create account"}
        </h2>
        <div className="auth-sub">
          {isAdmin
            ? "Create an interviewer/admin account."
            : "Create a candidate account to book a slot."}
        </div>
      </div>

      <form onSubmit={submit} className="form">
        {!fixedRole && (
          <div className="form-row">
            <div className="label">Account type</div>
            <select
              className="input"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="user">User (candidate)</option>
              <option value="admin">Admin (interviewer)</option>
            </select>
          </div>
        )}

        <div className="form-row">
          <div className="label">Name</div>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>

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
            placeholder="Create a password"
            type="password"
            autoComplete="new-password"
          />
        </div>

        {isAdmin && (
          <div className="form-row">
            <div className="label">Admin signup secret</div>
            <input
              className="input"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter admin secret"
              type="password"
            />
          </div>
        )}

        <div className="auth-actions">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </div>
      </form>

      <div className="auth-footer">
        <span>Already have an account?</span>
        <Link className="link" to="/login">
          Login
        </Link>
      </div>

      {error && <div className="empty">{error}</div>}
    </div>
  );
}

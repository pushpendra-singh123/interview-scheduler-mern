import "./index.css";
import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { clearAuth, getStoredUser, initAuthFromStorage, setAuth } from "./auth";
import { me } from "./api";

function RequireRole({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect({ user }) {
  if (!user) return <Home />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/user"} replace />;
}

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    initAuthFromStorage();
    // Best-effort refresh user info if token exists.
    (async () => {
      try {
        const stored = getStoredUser();
        if (!stored) return;
        const data = await me();
        setAuth(localStorage.getItem("auth_token"), data.user);
        setUser(data.user);
      } catch {
        // ignore
      }
    })();
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <div className="brand-title">Interview Scheduler</div>
            <div className="brand-sub">
              {user
                ? `Signed in as ${user.email} (${user.role})`
                : "Login to book an interview slot"}
            </div>
          </Link>

          <div className="navbar-spacer" />

          <div className="navbar-actions">
            {!user ? (
              <>
                <Link className="btn" to="/login">
                  Login
                </Link>
                <Link className="btn btn-outline" to="/signup">
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link className="btn btn-outline" to="/">
                  Home
                </Link>
                <Link
                  className="btn"
                  to={user.role === "admin" ? "/admin" : "/user"}
                >
                  Dashboard
                </Link>
                <button className="btn unbook" onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page">
        <div className="card">
          <Routes>
            <Route path="/" element={<HomeRedirect user={user} />} />
            <Route
              path="/login"
              element={
                <Login
                  onLogin={(u) => {
                    setUser(u);
                    navigate(u.role === "admin" ? "/admin" : "/user");
                  }}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <Signup
                  onSignup={(u) => {
                    setUser(u);
                    navigate(u.role === "admin" ? "/admin" : "/user");
                  }}
                />
              }
            />
            <Route
              path="/admin/signup"
              element={
                <Signup
                  role="admin"
                  onSignup={(u) => {
                    setUser(u);
                    navigate("/admin");
                  }}
                />
              }
            />

            <Route
              path="/user"
              element={
                <RequireRole user={user} role="user">
                  <UserDashboard user={user} />
                </RequireRole>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireRole user={user} role="admin">
                  <AdminDashboard user={user} />
                </RequireRole>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

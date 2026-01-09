import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-hero">
      <h2 className="home-title">Welcome</h2>
      <div className="home-text">
        Login to book an interview slot. Admins can login to create and update
        slots.
      </div>

      <div className="auth-actions">
        <Link className="btn" to="/login">
          Login
        </Link>
        <Link className="btn btn-outline" to="/signup">
          Signup
        </Link>
      </div>
    </div>
  );
}

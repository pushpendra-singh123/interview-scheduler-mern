import React, { useEffect, useMemo, useState } from "react";
import { bookSlot, fetchSlots, unbookSlot } from "../api";

export default function UserDashboard({ user }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const myUserId = useMemo(() => String(user?.id || user?._id || ""), [user]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSlots();
      setSlots(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doBook = async (id) => {
    try {
      const res = await bookSlot(id);
      alert(res.message || "Booked");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  const doUnbook = async (id) => {
    try {
      const res = await unbookSlot(id);
      alert(res.message || "Unbooked");
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Unbooking failed");
    }
  };

  if (loading) return <div className="loading">Loading slots…</div>;
  if (error) return <div className="empty">Error loading slots: {error}</div>;

  return (
    <div>
      <h2>User Dashboard</h2>
      <div className="app-sub">Logged in as {user?.email}</div>

      {slots.length === 0 && <div className="empty">No slots found</div>}

      <div className="slots-list" style={{ marginTop: 12 }}>
        {slots.map((s) => {
          const booked = s.bookedCount || 0;
          const max = s.maxCandidates || 0;
          const isFull = max > 0 && booked >= max;
          const mine = (s.bookings || []).some(
            (b) =>
              String(b?.user?._id || b?.user || "") === String(myUserId || "")
          );

          return (
            <div key={s._id} className="slot-row">
              <div className="slot-info">
                <div className="slot-time">
                  {new Date(s.startTime).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="slot-meta">
                  {booked}/{max} candidates
                </div>
              </div>

              <div className="slot-actions">
                {mine ? (
                  <button
                    className="btn unbook"
                    onClick={() => doUnbook(s._id)}
                  >
                    Unbook
                  </button>
                ) : isFull ? (
                  <div className="badge-full">Full</div>
                ) : (
                  <button className="btn" onClick={() => doBook(s._id)}>
                    Book
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

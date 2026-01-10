import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SlotList() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/slots")
      .then((res) => setSlots(res.data))
      .catch((err) => {
        console.error("Failed to fetch slots:", err);
        setError(err.response?.data?.message || err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  const refreshSlots = async () => {
    const list = await axios.get("/api/slots");
    setSlots(list.data);
  };

  const book = async (id) => {
    try {
      const email = prompt("Enter your email to book (must already exist):");
      if (!email) return;
      const res = await axios.post(`/api/slots/book/${id}`, { email });
      alert(res.data.message || "Booked");
      await refreshSlots();
    } catch (err) {
      console.error("Booking failed:", err);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  const unbook = async (id) => {
    try {
      const email = prompt("Enter email to unbook:");
      if (!email) return;
      const res = await axios.post(`/api/slots/unbook/${id}`, { email });
      alert(res.data.message || "Unbooked");
      await refreshSlots();
    } catch (err) {
      console.error("Unbooking failed:", err);
      alert(err.response?.data?.message || "Unbooking failed");
    }
  };

  if (loading) return <div className="loading">Loading slots…</div>;
  if (error) return <div className="empty">Error loading slots: {error}</div>;

  return (
    <div>
      <h2>Available Slots</h2>

      {slots.length === 0 && <div className="empty">No slots found</div>}

      <div className="slots-list">
        {slots.map((s) => {
          const booked = s.bookedCount || 0;
          const max = s.maxCandidates || 0;
          const isFull = max > 0 && booked >= max;
          return (
            <div key={s._id} className="slot-row">
              <div className="slot-info">
                <div className="slot-time">
                  {new Date(s.startTime).toLocaleString()}
                </div>
                <div className="slot-meta">
                  {booked}/{max} candidates
                </div>
              </div>

              <div className="slot-actions">
                {isFull ? (
                  <div className="badge-full">Full</div>
                ) : (
                  <button className="btn" onClick={() => book(s._id)}>
                    Book
                  </button>
                )}
                {s.bookings && s.bookings.length > 0 && (
                  <button className="btn unbook" onClick={() => unbook(s._id)}>
                    Unbook
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

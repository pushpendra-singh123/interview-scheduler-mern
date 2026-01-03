import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SlotList() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/slots")
      .then((res) => setSlots(res.data))
      .catch((err) => {
        console.error("Failed to fetch slots:", err);
        setError(err.response?.data?.message || err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  const book = (id) => {
    axios
      .post(`http://localhost:5000/api/slots/book/${id}`)
      .then(() => alert("Booked"))
      .catch((err) => {
        console.error("Booking failed:", err);
        alert(err.response?.data?.message || "Booking failed");
      });
  };

  if (loading) return <div>Loading slots…</div>;
  if (error)
    return <div style={{ color: "crimson" }}>Error loading slots: {error}</div>;

  return (
    <div>
      <h2>Available Slots</h2>
      {slots.length === 0 && <div>No slots found</div>}
      {slots.map((s) => {
        const booked = s.bookedCount || 0;
        const max = s.maxCandidates || 0;
        const isFull = max > 0 && booked >= max;
        return (
          <div
            key={s._id}
            style={{
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ marginRight: 8 }}>
              {new Date(s.startTime).toLocaleString()}
            </span>
            <span style={{ color: "#555", fontSize: 13 }}>
              {booked}/{max} candidates
            </span>
            <button onClick={() => book(s._id)} disabled={isFull}>
              {isFull ? "Full" : "Book"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

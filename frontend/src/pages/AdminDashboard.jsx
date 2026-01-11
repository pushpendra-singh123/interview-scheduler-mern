import React, { useEffect, useState } from "react";
import { createSlot, fetchSlots, updateSlot } from "../api";

function toInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function toSlotDraft(slot) {
  return {
    startTime: toInputValue(slot.startTime),
    endTime: toInputValue(slot.endTime),
    maxCandidates: String(slot.maxCandidates ?? ""),
  };
}

export default function AdminDashboard({ user }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [drafts, setDrafts] = useState({});
  const [savingById, setSavingById] = useState({});

  const [editingId, setEditingId] = useState(null);

  const [activeView, setActiveView] = useState("existing");

  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newMax, setNewMax] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSlots();
      setSlots(data);

      const nextDrafts = {};
      for (const s of data) {
        nextDrafts[s._id] = toSlotDraft(s);
      }
      setDrafts(nextDrafts);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addSlot = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        startTime: new Date(newStart).toISOString(),
        endTime: new Date(newEnd).toISOString(),
        maxCandidates: Number(newMax),
      };
      await createSlot(payload);
      setNewStart("");
      setNewEnd("");
      setNewMax(1);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create slot");
    }
  };

  const updateDraft = (slotId, patch) => {
    setDrafts((prev) => ({
      ...prev,
      [slotId]: { ...prev[slotId], ...patch },
    }));
  };

  const saveSlot = async (slot) => {
    const d = drafts[slot._id];
    if (!d) return;

    const patch = {};
    const startOriginal = toInputValue(slot.startTime);
    const endOriginal = toInputValue(slot.endTime);
    const maxOriginal = String(slot.maxCandidates ?? "");

    if (d.startTime && d.startTime !== startOriginal)
      patch.startTime = new Date(d.startTime).toISOString();
    if (d.endTime && d.endTime !== endOriginal)
      patch.endTime = new Date(d.endTime).toISOString();
    if (d.maxCandidates !== maxOriginal)
      patch.maxCandidates = Number(d.maxCandidates);

    if (Object.keys(patch).length === 0) return;

    setSavingById((p) => ({ ...p, [slot._id]: true }));
    try {
      await updateSlot(slot._id, patch);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update slot");
    } finally {
      setSavingById((p) => ({ ...p, [slot._id]: false }));
    }
  };

  const cancelEdit = (slot) => {
    updateDraft(slot._id, toSlotDraft(slot));
    setEditingId(null);
  };

  if (loading) return <div className="loading">Loading slots…</div>;
  if (error) return <div className="empty">Error loading slots: {error}</div>;

  const bookedUsers = (slots || [])
    .flatMap((s) =>
      (s.bookings || []).map((b) => ({
        slotId: s._id,
        startTime: s.startTime,
        endTime: s.endTime,
        name: b?.user?.name || b?.name || "",
        email: b?.user?.email || b?.email || "",
      }))
    )
    .filter((x) => x.email);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="app-sub">Logged in as {user?.email}</div>

      <div className="auth-actions" style={{ marginTop: 12 }}>
        <button
          className={activeView === "booked" ? "btn" : "btn btn-outline"}
          type="button"
          onClick={() => setActiveView("booked")}
        >
          Booked Users ({bookedUsers.length})
        </button>

        <button
          className={activeView === "create" ? "btn" : "btn btn-outline"}
          type="button"
          onClick={() => setActiveView("create")}
        >
          Create Slot
        </button>

        <button
          className={activeView === "existing" ? "btn" : "btn btn-outline"}
          type="button"
          onClick={() => setActiveView("existing")}
        >
          Existing Slots
        </button>
      </div>

      {activeView === "booked" && (
        <div style={{ marginTop: 10 }}>
          {bookedUsers.length === 0 ? (
            <div className="empty">No bookings yet</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Interview Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bookedUsers.map((b, idx) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);
                  return (
                    <tr key={`${b.slotId}-${b.email}-${idx}`}>
                      <td>
                        {b.name || <span className="table-muted">—</span>}
                      </td>
                      <td>{b.email}</td>
                      <td>
                        {Number.isNaN(start.getTime())
                          ? "—"
                          : start.toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })}
                      </td>
                      <td>
                        {Number.isNaN(start.getTime())
                          ? "—"
                          : `${start.toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} – ${end.toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeView === "create" && (
        <>
          <h3 style={{ marginTop: 12 }}>Create Slot</h3>
          <form onSubmit={addSlot}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="input"
                type="datetime-local"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
              />
              <input
                className="input"
                type="datetime-local"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
              />
              <input
                className="input"
                value={newMax}
                onChange={(e) => setNewMax(e.target.value)}
                placeholder="Max candidates"
                inputMode="numeric"
                style={{ width: 160 }}
              />
              <button className="btn" type="submit">
                Add
              </button>
            </div>
          </form>
        </>
      )}

      {activeView === "existing" && (
        <>
          <h3 style={{ marginTop: 16 }}>Existing Slots</h3>
          {slots.length === 0 && <div className="empty">No slots found</div>}

          <div className="slots-list" style={{ marginTop: 12 }}>
            {slots.map((s) => {
              const booked = s.bookedCount || 0;
              const max = s.maxCandidates || 0;
              const full = max > 0 && booked >= max;

              const d = drafts[s._id] || toSlotDraft(s);

              const dirty =
                d.startTime !== toInputValue(s.startTime) ||
                d.endTime !== toInputValue(s.endTime) ||
                String(d.maxCandidates) !== String(s.maxCandidates ?? "");

              const saving = !!savingById[s._id];
              const isEditing = editingId === s._id;

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
                      })}{" "}
                      —{" "}
                      {new Date(s.endTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="slot-meta">
                      {booked}/{max} candidates {full ? "(Full)" : ""}
                    </div>
                  </div>

                  <div
                    className="slot-actions"
                    style={{ gap: 8, flexWrap: "wrap" }}
                  >
                    {!isEditing ? (
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={() => setEditingId(s._id)}
                      >
                        Edit
                      </button>
                    ) : (
                      <>
                        <input
                          className="input"
                          type="datetime-local"
                          value={d.startTime}
                          onChange={(e) =>
                            updateDraft(s._id, { startTime: e.target.value })
                          }
                        />
                        <input
                          className="input"
                          type="datetime-local"
                          value={d.endTime}
                          onChange={(e) =>
                            updateDraft(s._id, { endTime: e.target.value })
                          }
                        />
                        <input
                          className="input"
                          value={d.maxCandidates}
                          onChange={(e) =>
                            updateDraft(s._id, {
                              maxCandidates: e.target.value,
                            })
                          }
                          inputMode="numeric"
                          style={{ width: 90 }}
                        />

                        <button
                          className="btn"
                          disabled={!dirty || saving}
                          onClick={async () => {
                            await saveSlot(s);
                            setEditingId(null);
                          }}
                          type="button"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          className="btn btn-outline"
                          disabled={saving}
                          onClick={() => cancelEdit(s)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

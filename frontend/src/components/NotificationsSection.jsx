import React from "react";

function timeAgo(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 48) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export default function NotificationsSection({
  title = "Notifications",
  items = [],
}) {
  return (
    <div className="notif-card">
      <div className="notif-top">
        <div className="notif-title">{title}</div>
      </div>

      {(items || []).length === 0 ? (
        <div className="empty" style={{ padding: 12 }}>
          No notifications yet
        </div>
      ) : (
        <div className="notif-list">
          {(items || []).map((n) => (
            <div key={n._id || n.id} className="notif-item">
              <div className="notif-body">
                <div className="notif-row">
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                </div>
              </div>

              {!n.seenAt && (
                <div className="notif-dot-right" aria-label="New" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

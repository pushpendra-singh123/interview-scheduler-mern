import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredToken } from "../auth";
import { createAuthedSocket } from "../socket";

export function useNotifications({ fetchFn, markSeenFn, active }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const unseenCount = useMemo(
    () => (items || []).filter((n) => !n.seenAt).length,
    [items]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFn();
      setItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const token = getStoredToken();
    if (!token) return;

    const socket = createAuthedSocket(token);
    socket.on("notification:new", (payload) => {
      if (!payload) return;
      setItems((prev) => [payload, ...(prev || [])]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAllUnseenSeen = async () => {
    const unseenIds = (items || [])
      .filter((n) => !n.seenAt)
      .map((n) => n._id)
      .filter(Boolean);

    if (unseenIds.length === 0) return;

    try {
      await markSeenFn(unseenIds);
      const nowIso = new Date().toISOString();
      setItems((prev) =>
        (prev || []).map((n) =>
          unseenIds.includes(n._id) ? { ...n, seenAt: nowIso } : n
        )
      );
    } catch {
      // ignore
    }
  };

  const prevActiveRef = useRef(Boolean(active));
  useEffect(() => {
    const prev = prevActiveRef.current;
    if (prev && !active) markAllUnseenSeen();
    prevActiveRef.current = Boolean(active);
  }, [active]);

  return { items, loading, error, unseenCount };
}

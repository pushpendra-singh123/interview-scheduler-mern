import axios from "axios";

export async function signup({ name, email, password, role, adminSecret }) {
  const res = await axios.post("/api/auth/signup", {
    name,
    email,
    password,
    role,
    adminSecret,
  });
  return res.data;
}

export async function login({ email, password }) {
  const res = await axios.post("/api/auth/login", { email, password });
  return res.data;
}

export async function fetchSlots() {
  const res = await axios.get("/api/slots");
  return res.data;
}

export async function bookSlot(slotId) {
  const res = await axios.post(`/api/slots/book/${slotId}`);
  return res.data;
}

export async function unbookSlot(slotId) {
  const res = await axios.post(`/api/slots/unbook/${slotId}`);
  return res.data;
}

export async function createSlot(payload) {
  const res = await axios.post("/api/slots/createSlot", payload);
  return res.data;
}

export async function updateSlot(slotId, payload) {
  const res = await axios.patch(`/api/slots/update/${slotId}`, payload);
  return res.data;
}

export async function fetchAdminNotifications() {
  const res = await axios.get("/api/notifications/adminNotifications");
  return res.data;
}

export async function markAdminNotificationsSeen(ids) {
  const res = await axios.patch("/api/notifications/adminNotifications/seen", {
    ids: Array.isArray(ids) ? ids : undefined,
  });
  return res.data;
}

export async function fetchUserNotifications() {
  const res = await axios.get("/api/notifications/userNotifications");
  return res.data;
}

export async function markUserNotificationsSeen(ids) {
  const res = await axios.patch("/api/notifications/userNotifications/seen", {
    ids: Array.isArray(ids) ? ids : undefined,
  });
  return res.data;
}

import axios from "axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export function setAuth(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
  }

  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

export function initAuthFromStorage() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  return { token, user: getStoredUser() };
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  setAuth(null, null);
}

import { io } from "socket.io-client";

export function createAuthedSocket(token) {
  const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

  return io(baseUrl, {
    transports: ["websocket", "polling"],
    auth: { token },
  });
}

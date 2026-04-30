import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../config/api";

const SOCKET_URL = API_BASE_URL.replace("/api", "");
let socket: Socket | null = null;

export const initiateSocket = (userId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("🟢 Đã kết nối Socket server:", socket?.id);
      socket?.emit("user_connected", userId);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Mất kết nối Socket");
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
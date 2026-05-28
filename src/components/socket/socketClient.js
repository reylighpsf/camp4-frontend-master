import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

export default getSocket;

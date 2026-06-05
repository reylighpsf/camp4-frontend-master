import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api\/?$/, "");
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || "/ws/";
const CROWD_NAMESPACE = import.meta.env.VITE_CROWD_SOCKET_NAMESPACE || "/ws/crowd";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(`${SOCKET_URL}${CROWD_NAMESPACE}`, {
      autoConnect: false,
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
};

export default getSocket;

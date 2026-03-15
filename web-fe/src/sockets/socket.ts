import { getAccessToken } from "@/lib/auth-storage";
import { io, type Socket } from "socket.io-client";

const baseUrl = import.meta.env.VITE_API_SOCKET_URL;
let socket: Socket | null = null;
const connectSocket = () => {
	const access = getAccessToken();
	if (socket) return; // Socket already exists
	socket = io(baseUrl, {
		auth: { token: access },
		transports: ["websocket"],
	});
	socket.on("connect", () => {
		console.log("Socket connected:", socket?.id);
	});
	socket.on("system_notification", (data) => {
		console.log("Received system notification:", data);
		// Here you can integrate with your notification system to show to users
	});
};
const getSocket = () => {
	if (!socket) {
		connectSocket();
	}
	return socket;
};
const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
		console.log("Socket disconnected");
	}
};
export { socket, connectSocket, disconnectSocket, getSocket };

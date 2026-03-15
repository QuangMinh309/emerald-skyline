// sockets/socket.provider.tsx
import { getStoredUser } from "@/lib/auth-storage";
import { connectSocket, disconnectSocket, socket } from "@/sockets/socket";
import { createContext, useContext, useEffect } from "react";

const SocketContext = createContext(socket);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
	const user = getStoredUser();
	useEffect(() => {
		if (user) connectSocket();
		return () => {
			disconnectSocket();
		};
		// khi component bị unmount
	}, []);

	return (
		<SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
	);
};

export const useSocketContext = () => useContext(SocketContext);

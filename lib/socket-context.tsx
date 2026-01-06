"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import io, { Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<number>;
  typingUsers: Map<number, Set<number>>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
});

export const useSocket = () => {
  return useContext(SocketContext);
};

interface SocketProviderProps {
  children: ReactNode;
  userId?: number;
}

export const SocketProvider = ({ children, userId }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<number, Set<number>>>(
    new Map()
  );

  useEffect(() => {
    // Direct connection to server (no /api/socket path needed)
    const socketInstance = io("http://localhost:3000", {
      transports: ["websocket", "polling"], // Try websocket first
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id);
      setIsConnected(true);
      
      if (userId) {
        socketInstance.emit("authenticate", { userId });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
    });

    return () => {
      console.log("🧹 Cleaning up socket");
      socketInstance.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, onlineUsers, typingUsers }}
    >
      {children}
    </SocketContext.Provider>
  );
};
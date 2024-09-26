import { locales } from "@/resources";
import { AuthSlice } from "@/store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo } = AuthSlice();

  useEffect(() => {
    if (userInfo) {
      const newSocket = io(locales.serverUrl, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });
      setSocket(newSocket);
      newSocket.on("connect", () => {
        console.log("Conected to socket server");
      });

      newSocket.on("received", (message: any) =>
        console.log("message", message)
      );

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

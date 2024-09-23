import { locales } from "@/resources";
import { AuthSlice } from "@/store";
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socket: any = useRef();
  const { userInfo } = AuthSlice();
  const connection =
    locales.enviroment == "production"
      ? locales.socketApi
      : `${locales.socketHost}:${locales.socketPort}`;

  useEffect(() => {
    if (userInfo) {
      socket.current = io(connection, {
        withCredentials: true,
        query: { userId: userInfo.id },
        transports: ["websocket"],
      });
      socket.current.on("connect", () => {
        console.log("Conected to socket server");
      });

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

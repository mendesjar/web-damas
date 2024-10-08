import { locales, typeUser } from "@/resources";
import { AppStore } from "@/store";
import { Message } from "@/views/game/interfaces";
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
  const { userInfo, setTypeUser, setMovement } = AppStore();

  useEffect(() => {
    if (userInfo) {
      const newSocket = io(locales.serverUrl, {
        withCredentials: true,
        query: userInfo,
      });
      setSocket(newSocket);
      newSocket.on("connect", () => {
        console.log("Conected to socket server");
      });

      /* newSocket.emit("verifyTypeUser", {
        userId: userInfo.id,
        roomId: userInfo.roomId,
      }); */

      newSocket.on("typeUser", (type: typeUser) => {
        setTypeUser(type);
      });

      newSocket.on("receivedMovePieceList", (messages: any) => {
        const { setMoves } = AppStore.getState();
        setMoves(messages);
      });

      newSocket.on("pieceMovement", (message: Message) => {
        setMovement(message);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

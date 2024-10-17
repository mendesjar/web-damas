import { locales, typeUser } from "@/resources";
import { AppStore } from "@/store";
import { Message, Movement } from "@/views/game/interfaces";
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
  const { userInfo, setOpponentName, setTypeUser, setStartGame, setMovement } =
    AppStore();

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

      newSocket.on(
        "validStartGame",
        (startGame: {
          users: { primary: string; secundary: string };
          isValid: boolean;
        }) => {
          const opponentName =
            startGame.users.primary !== userInfo.userName
              ? startGame.users.primary
              : startGame.users.secundary;
          setOpponentName(opponentName);
          setStartGame(startGame.isValid);
        }
      );

      newSocket.on("typeUser", (type: typeUser) => {
        setTypeUser(type);
      });

      newSocket.on("receivedMovePieceList", (messages: Movement) => {
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

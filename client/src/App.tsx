import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { faker } from "@faker-js/faker";
import { Button } from "./components/ui/button";
import { Circle, CopySimple } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
//import { SessionService } from "./services";

interface Message {
  id: string;
  name: string;
  x: string;
  y: string;
}

interface Board {
  piece: any;
  x: string;
  y: string;
  color: string;
}

interface Payload {
  id: string;
  name: string;
  path: string;
}

function App() {
  const [board, setBoard] = useState<Board[][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  //const sessionService = new SessionService();
  //const usuario = sessionService.getUsuario();
  const { toast } = useToast();
  const path = window.location.pathname.replace(/\s|\//g, "");

  const socket = io("https://web-damas-socket.onrender.com", {
    transports: ["websocket"],
  });

  useEffect(() => {
    function receivedMenssage(message: any) {
      const newMessage: Message = {
        id: faker.string.uuid(),
        name: message.name,
        x: "20",
        y: "15",
      };
      setMessages([...messages, newMessage]);
    }
    socket.on(`msgToClient:${path}`, (message: Payload) => {
      receivedMenssage(message);
    });
  }, [messages]);

  /*   function sendMessage() {
    const message: Payload = {
      id: usuario.id,
      name: usuario.nome,
      path,
    };
    socket.emit("msgToServer", message);
  } */

  const createBoard = () => {
    const newBoard: Board[][] = [];

    for (let row = 0; row < 8; row++) {
      const newRow: Board[] = [];

      for (let column = 0; column < 8; column++) {
        const square: any = {
          color: (row + column) % 2 === 0 ? "bg-white" : "bg-black",
          piece: null,
        };
        if (row <= 2 && (row + column) % 2 === 1) {
          square.piece = { type: "pawn", color: "text-orange-200" };
        } else if (row >= 5 && (row + column) % 2 === 1) {
          square.piece = { type: "pawn", color: "text-amber-800" };
        }
        newRow.push(square);
      }
      newBoard.push(newRow);
    }
    setBoard(newBoard);
  };

  useEffect(() => {
    createBoard();
  }, []);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-slate-800">
        <div id="game">
          <table
            className="flex flex-col justify-center items-center w-min mt-5 m-auto p-3 border rounded-md"
            onContextMenu={(e) => e.preventDefault()}
          >
            <tbody>
              {board.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="row flex w-min">
                  {row.map((column, columnIndex) => (
                    <td
                      key={`column-${columnIndex}`}
                      className="column select-none cursor-pointer"
                    >
                      <div
                        className={`square flex w-6 h-6 justify-center items-center ${column.color} hover:bg-gray-600 rounded`}
                      >
                        {column.piece && (
                          <Circle
                            weight="fill"
                            className={`${column.piece.color}`}
                          />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Button
        className="fixed bottom-5 left-10 right-10 xl:left-1/4 xl:right-1/4 md:left-60 md:right-60 sm:left-10 sm:right-10 bg-slate-700 hover:bg-slate-900 text-white"
        onClick={() => {
          navigator.clipboard.writeText(path);
          toast({
            description: "Código copiado",
          });
        }}
      >
        <p className="mr-3">{path}</p>
        <CopySimple weight="fill" />
      </Button>
      <Toaster />
    </>
  );
}

export default App;

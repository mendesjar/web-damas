import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { faker } from "@faker-js/faker";
import { Button } from "./components/ui/button";
import { CopySimple } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { SessionService } from "./services";

interface Message {
  id: string;
  name: string;
  x: string;
  y: string;
}

interface Payload {
  id: string;
  name: string;
  path: string;
}

function App() {
  const [matriz, setMatriz] = useState<Message[][]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const sessionService = new SessionService();
  const usuario = sessionService.getUsuario();
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

  function sendMessage() {
    const message: Payload = {
      id: usuario.id,
      name: usuario.nome,
      path,
    };
    socket.emit("msgToServer", message);
  }

  const formarMatriz = (rows: number, columns: number) => {
    const newMatriz: Message[][] = [];

    for (let row = 0; row < rows; row++) {
      const newRow: any[] = [];

      for (let column = 0; column < columns; column++) {
        const square: any = {
          x: "0",
          y: "0",
        };
        newRow.push(square);
      }
      newMatriz.push(newRow);
    }
    setMatriz(newMatriz);
  };

  useEffect(() => {
    formarMatriz(8, 8);
  }, []);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div id="game">
          <table
            className="flex flex-col justify-center items-center w-min mt-5 m-auto p-3 border rounded-md"
            onContextMenu={(e) => e.preventDefault()}
          >
            <tbody>
              {matriz.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="row flex w-min">
                  {row.map((column, columnIndex) => (
                    <td
                      key={`column-${columnIndex}`}
                      className="column select-none cursor-pointer"
                    >
                      <div className="square flex w-6 h-6 justify-center items-center bg-slate-200 hover:bg-gray-300 rounded-sm"></div>
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

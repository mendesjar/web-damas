import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { faker } from "@faker-js/faker";
import { Button } from "./components/ui/button";
import { CopySimple } from "@phosphor-icons/react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: () => string;
  name: string;
  x: string;
  y: string;
}

interface Payload {
  name: string;
  path: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nome, setNome] = useState<string>("");
  const { toast } = useToast();
  const path = window.location.pathname.replace(/\s|\//g, "");

  const socket = io("https://web-damas-socket.onrender.com", {
    transports: ["websocket"],
  });

  useEffect(() => {
    function receivedMenssage(message: any) {
      const newMessage: Message = {
        id: faker.string.uuid,
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
      name: nome,
      path,
    };
    socket.emit("msgToServer", message);
    setNome("");
  }

  return (
    <>
      <div className="card">
        <div>
          {messages.map((message) => {
            return (
              <p>
                nome: {message.name} x: {message.x} , y: {message.y}
              </p>
            );
          })}
        </div>
        <input
          type="text"
          placeholder="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button className="bg-gray-700 p-2" onClick={() => sendMessage()}>
          Enviar
        </button>
      </div>
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

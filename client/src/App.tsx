import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { faker } from "@faker-js/faker";

interface Message {
  id: () => string;
  name: string;
  x: string;
  y: string;
}

interface Payload {
  name: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nome, setNome] = useState<string>("");

  const socket = io("localhost:3333", {
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
    socket.on("msgToClient", (message: Payload) => {
      receivedMenssage(message);
    });
  }, [messages]);

  function sendMessage() {
    const message: Payload = {
      name: nome,
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
        <button className="bg-gray-700 p-2" onClick={() => sendMessage()}>Enviar</button>
      </div>
    </>
  );
}

export default App;

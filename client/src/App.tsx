import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { faker } from "@faker-js/faker";

interface Message {
  id: () => string;
  name: string;
  text: string;
}

interface Payload {
  name: string;
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nome, setNome] = useState<string>("");
  const [text, setText] = useState<string>("");

  const socket = io("localhost:3333", {
    transports: ["websocket"],
  });

  useEffect(() => {
    function receivedMenssage(message: any) {
      const newMessage: Message = {
        id: faker.string.uuid,
        name: message.name,
        text: message.text,
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
      text,
    };
    socket.emit("msgToServer", message);
    setText("");
    setNome("");
  }

  return (
    <>
      <div className="card">
        <div>
          {messages.map((message) => {
            return (
              <p>
                nome: {message.name}, mensagem: {message.text}
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
        <input
          type="text"
          placeholder="mensagem"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={() => sendMessage()}>Enviar</button>
      </div>
    </>
  );
}

export default App;

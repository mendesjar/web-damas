import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorageHelper } from "@/helpers";
import { faker } from "@faker-js/faker";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { io } from "socket.io-client";
import { SessionService } from "@/services";

interface User {
  id: string;
  nome: string;
  color: string;
  adm: boolean;
}

const StartGame = () => {
  const history = useNavigate();
  const [codRoom, setCodRoom] = useState<string>("");
  const [nameUser, setNameUser] = useState<string>("");
  const sessionService = new SessionService();
  const storageHelper = new StorageHelper();
  const { toast } = useToast();

  const socket = io("localhost:3333", {
    transports: ["websocket"],
  });

  function generateRoomGame(codRoom: string | null) {
    if (nameUser?.length < 2) {
      toast({
        title: "Nome de Usuário",
        description: "Nome de usuário com tamanho incorreto",
        variant: "destructive",
      });
      return document.getElementById("nameUser")?.focus();
    }
    if (codRoom) {
      createUser(null);
      getUser(codRoom);
    } else {
      const urlRoom = faker.string.sample(5);
      createUser("text-amber-800");
      history(`/${urlRoom.toUpperCase()}`);
    }
  }

  function getUser(path: string) {
    const usuario: User = sessionService.getUsuario();
    socket.emit("msgToServerGetAllUsers", usuario);
    socket.on(`msgToClientGetAllUser:${path}`, (message: User[]) => {
      console.log(message);
    });
  }

  /* useEffect(() => {
    const usuario: User = sessionService.getUsuario();
    socket.on(`msgToClient:${usuario?.id}`, (message: User[]) => {
      console.log(message);
    });
  }, []); */

  function createUser(initColor: string | null) {
    const user: User = {
      id: faker.string.uuid(),
      nome: nameUser,
      color: initColor ? initColor : "text-amber-800",
      adm: initColor ? true : false,
    };
    storageHelper.setLocal("user", JSON.stringify(user));
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-900">
      <div className="mb-5">
        <Input
          id="nameUser"
          type="text"
          placeholder="Seu nome"
          required
          onChange={(e) => setNameUser(e.target.value)}
        />
      </div>
      <Button
        className="py-16 px-32 bg-white hover:bg-slate-700 text-slate-900 hover:text-white text-xl"
        onClick={() => generateRoomGame(null)}
      >
        Jogar Agora
      </Button>
      <div className="my-8">
        <p className="text-center text-sm text-white uppercase">
          ou entre com código
        </p>
      </div>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Digite o código"
          onChange={(e) => setCodRoom(e.target.value)}
        />
        <Button
          className="bg-white hover:bg-slate-700 text-slate-900 hover:text-white"
          onClick={() => generateRoomGame(codRoom)}
        >
          Entrar
        </Button>
      </div>
      <Toaster />
    </div>
  );
};

export default StartGame;

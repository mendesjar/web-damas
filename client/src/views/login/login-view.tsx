import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorageHelper } from "@/helpers";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { locales } from "@/resources";
import { io } from "socket.io-client";
import { SessionService } from "@/services";

interface User {
  id: string;
  name: string;
  roomId: string;
}

const LoginView = () => {
  const history = useNavigate();
  const [codRoom, setCodRoom] = useState<string>("");
  const [nameUser, setNameUser] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const storageHelper = new StorageHelper();
  const sessionService = new SessionService();
  let roomId: string;
  const { toast } = useToast();
  const connection =
    locales.enviroment == "production"
      ? locales.socketApi
      : `${locales.socketHost}:${locales.socketPort}`;

  const socket = io(connection, {
    transports: ["websocket"],
  });

  function createRoomMessage(user: User) {
    socket.emit("joinRoom", user);
  }

  useEffect(() => {
    socket.on("playerList", (message: User[]) => {
      if (roomId) {
        let playerList = sessionService.getPlayerList();
        if (playerList?.length) {
          playerList.push(message);
        } else {
          playerList = message;
        }
        storageHelper.setLocal("playerList", JSON.stringify(playerList));
        history(`/${roomId.toUpperCase()}`);
      }
    });
  }, []);

  async function generateRoomGame(codRoom: string | null) {
    if (nameUser?.length < 2) {
      toast({
        title: "Nome de Usuário",
        description: "Nome de usuário com tamanho incorreto",
        variant: "destructive",
        duration: 1000,
      });
      setError(true);
      return document.getElementById("nameUser")?.focus();
    }
    roomId = codRoom
      ? codRoom
      : faker.lorem.word({ length: { min: 5, max: 7 } });
    const user = createUser(roomId);
    createRoomMessage(user);
    setError(false);
  }

  function createUser(roomId: string) {
    const user: User = {
      id: faker.string.uuid(),
      name: nameUser,
      roomId,
    };
    storageHelper.setLocal("user", JSON.stringify(user));
    return user;
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-900">
      <div>
        <div className="w-full">
          <Input
            id="nameUser"
            className="bg-primary text-primary-foreground"
            type="text"
            fullWidth={false}
            placeholder="Seu nome"
            required
            error={error ? "Nome inválido" : undefined}
            onChange={(e) => setNameUser(e.target.value)}
          />
        </div>
        <hr className="w-full my-10" />
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
            className="bg-primary text-primary-foreground"
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
      </div>
      <Toaster />
    </div>
  );
};

export default LoginView;

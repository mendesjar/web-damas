import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorageHelper } from "@/helpers";
import { faker } from "@faker-js/faker";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { locales } from "@/resources";
import { io } from "socket.io-client";
// import { SessionService } from "@/services";

interface User {
  id?: string;
  userName: string;
  roomId?: string;
}

const LoginView = () => {
  const history = useNavigate();
  const [codRoom, setCodRoom] = useState<string>("");
  const [user, setUser] = useState<User>({
    userName: "",
  });
  const [error, setError] = useState<boolean>(false);
  const storageHelper = new StorageHelper();
  // const sessionService = new SessionService();
  const { toast } = useToast();
  const connection =
    locales.enviroment == "production"
      ? locales.socketApi
      : `${locales.socketHost}:${locales.socketPort}`;

  const socket = io(connection, {
    transports: ["websocket"],
  });

  async function generateRoomGame(codRoom: string | null) {
    if (user.userName?.length < 2) {
      toast({
        title: "Nome de Usuário",
        description: "Nome de usuário com tamanho incorreto",
        variant: "destructive",
        duration: 1000,
      });
      setError(true);
      return document.getElementById("nameUser")?.focus();
    }
    const cod = codRoom
      ? codRoom
      : faker.lorem.word({ length: { min: 5, max: 7 } });
    const userCreated = createUser(cod);

    if (codRoom) joinRoomMessage(userCreated);
    else createRoomMessage(userCreated);

    history(`/${cod.toUpperCase()}`);
    setError(false);
  }

  function createRoomMessage(user: User) {
    socket.emit("createRoom", user);
  }

  function joinRoomMessage(user: User) {
    socket.emit("joinRoom", user);
  }

  function createUser(roomId: string) {
    const userTemp: User = {
      id: user.id,
      userName: user.userName,
      roomId: roomId.toUpperCase(),
    };
    storageHelper.setLocal("user", JSON.stringify(userTemp));
    return userTemp;
  }

  useEffect(() => {
    socket.on("connect", () => {
      setUser({ ...user, id: socket.id });
    });
  }, []);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const userTemp = {
      ...user,
      [e.target.name]: e.target.value,
    };
    setUser(userTemp);
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-900">
      <div>
        <div className="w-full">
          <Input
            id="userName"
            name="userName"
            className="bg-primary text-primary-foreground"
            type="text"
            fullWidth={false}
            placeholder="Seu nome"
            required
            value={user?.userName}
            error={error ? "Nome inválido" : undefined}
            onChange={(e) => handleInputChange(e)}
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

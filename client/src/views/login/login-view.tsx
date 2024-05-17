import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StorageHelper } from "@/helpers";
import { faker } from "@faker-js/faker";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { SocketCliente } from "@/external/socket.cliente";
// import { SessionService } from "@/services";

interface User {
  id: string;
  userName: string;
  roomId?: string;
}

const LoginView = () => {
  const history = useNavigate();
  const [codRoom, setCodRoom] = useState<string>("");
  const [user, setUser] = useState<User>({
    id: faker.string.uuid(),
    userName: "",
  });
  const [error, setError] = useState<boolean>(false);
  const storageHelper = new StorageHelper();
  const socketCliente = new SocketCliente();
  const { toast } = useToast();

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
    setError(false);
  }

  async function createRoomMessage(user: User) {
    const result: { isValid: boolean; responseMessage?: string } =
      await socketCliente.get("createRoom", `sendCreateRoom:${user.id}`, user);
    if (result.isValid && user.roomId) {
      history(`/${user.roomId.toUpperCase()}`);
    } else {
      toast({
        title: "Error",
        description: result.responseMessage,
        duration: 1000,
      });
    }
  }

  async function joinRoomMessage(user: User) {
    const result: { isValid: boolean; responseMessage?: string } =
      await socketCliente.get("joinRoom", `sendJoinRoom:${user.id}`, user);
    if (result.isValid && user.roomId) {
      history(`/${user.roomId.toUpperCase()}`);
    } else {
      toast({
        title: "Error",
        description: result.responseMessage,
        duration: 1000,
      });
    }
  }

  function createUser(roomId: string) {
    const userTemp: User = {
      id: faker.string.uuid(),
      userName: user.userName,
      roomId: roomId.toUpperCase(),
    };
    storageHelper.setLocal("user", JSON.stringify(userTemp));
    return userTemp;
  }

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

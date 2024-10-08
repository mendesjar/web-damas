import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { faker } from "@faker-js/faker";
import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/resources";
import { AppStore } from "@/store";

const LoginView = () => {
  const history = useNavigate();
  const { setUserInfo } = AppStore();
  const [codRoom, setCodRoom] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<boolean>(false);
  const { toast } = useToast();

  async function generateRoomGame(codRoom: string | null) {
    if (!user) return;
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
    createUser(cod);
    history(`/${cod.toUpperCase()}`);
    setError(false);
  }

  function createUser(roomId: string) {
    if (!user) return;
    const userTemp: User = {
      id: faker.string.uuid(),
      userName: user.userName,
      roomId: roomId.toUpperCase(),
    };
    setUserInfo(userTemp);
    return userTemp;
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const userTemp: any = {
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

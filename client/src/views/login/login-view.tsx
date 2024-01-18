import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { faker } from "@faker-js/faker";
import { useState } from "react";
import { Link } from "react-router-dom";

const StartGame = () => {
  const [codRoom, setCodRoom] = useState<string>("");

  function generateRoomGame(codRoom: string | null) {
    const urlRoom = codRoom ? codRoom : faker.string.sample(5);
    return `/${urlRoom.toUpperCase()}`;
  }
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-900">
      <Link to={generateRoomGame(null)}>
        <Button className="py-16 px-32 bg-white hover:bg-slate-700 text-slate-900 hover:text-white text-xl">
          Jogar Agora
        </Button>
      </Link>
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
        <Link to={generateRoomGame(codRoom)}>
          <Button className="bg-white hover:bg-slate-700 text-slate-900 hover:text-white">
            Entrar
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StartGame;

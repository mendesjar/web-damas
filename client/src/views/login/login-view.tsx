import { Button } from "@/components/ui/button";
import { faker } from "@faker-js/faker";
import { Link } from "react-router-dom";

const StartGame = () => {
  function generateRoomGame() {
    const urlRoom = `/rooms/${faker.string.uuid()}`;
    return urlRoom;
  }
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-slate-900">
      <Link to={generateRoomGame()}>
        <Button className="py-16 px-32 bg-white hover:bg-slate-700 text-slate-900 hover:text-white text-xl">
          Jogar Agora
        </Button>
      </Link>
    </div>
  );
};

export default StartGame;

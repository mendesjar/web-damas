import { Button } from "@/components/ui/button";

const StartGame = () => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-slate-900">
      <Button className="py-16 px-32 bg-white hover:bg-slate-700 text-slate-900 hover:text-white text-xl">
        Jogar Agora
      </Button>
    </div>
  );
};

export default StartGame;

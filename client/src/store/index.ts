import { typeUser, User } from "@/resources";
import { Message, Movement } from "@/views/game/interfaces";
import { create } from "zustand";

type Store = {
  userInfo: User | undefined;
  setUserInfo: (user: User) => void;
  opponentName: string | undefined;
  setOpponentName: (userName: string) => void;
  typeUser: typeUser;
  setTypeUser: (type: typeUser) => void;
  startGame: boolean;
  setStartGame: (startGame: boolean) => void;
  selectedMoves: Movement[];
  setMoves: (messages: Movement) => void;
  movement: Message | undefined;
  setMovement: (message: Message) => void;
};

export const AppStore = create<Store>()((set, get) => ({
  ...{
    userInfo: undefined,
    setUserInfo: (userInfo: User) => set({ userInfo }),
  },
  ...{
    opponentName: undefined,
    setOpponentName: (userName: string) => set({ opponentName: userName }),
  },
  ...{
    movement: undefined,
    setMovement: (message: Message) => set({ movement: message }),
  },
  ...{
    typeUser: "VISITOR",
    setTypeUser: (type) => set({ typeUser: type }),
  },
  ...{
    startGame: false,
    setStartGame: (valid) => set({ startGame: valid }),
  },
  ...{
    selectedMoves: [],
    setMoves: (messages: Movement) => {
      const selectedMoves = get().selectedMoves;

      set({
        selectedMoves: [
          ...selectedMoves,
          {
            ...messages,
          },
        ],
      });
    },
  },
}));

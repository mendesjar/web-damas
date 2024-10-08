import { typeUser, User } from "@/resources";
import { Message } from "@/views/game/interfaces";
import { create } from "zustand";

type Store = {
  userInfo: User | undefined;
  setUserInfo: (user: User) => void;
  typeUser: typeUser;
  setTypeUser: (type: typeUser) => void;
  startGame: boolean;
  setStartGame: (startGame: boolean) => void;
  selectedMoves: Message[];
  setMoves: (messages: any) => void;
  movement: Message | undefined;
  setMovement: (message: Message) => void;
};

export const AppStore = create<Store>()((set, get) => ({
  ...{
    userInfo: undefined,
    setUserInfo: (userInfo: User) => set({ userInfo }),
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
    setMoves: (messages: any) => {
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

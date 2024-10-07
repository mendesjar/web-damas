import { User } from "@/resources";
import { Message } from "@/views/game/interfaces";
import { create } from "zustand";

type Store = {
  userInfo: User | undefined;
  setUserInfo: (user: User) => void;
  selectedMoves: Message[];
  setMoves: (messages: any) => void;
};

export const AppStore = create<Store>()((set, get) => ({
  ...{
    userInfo: undefined,
    setUserInfo: (userInfo: User) => set({ userInfo }),
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

/* const AuthSlice = (set: {
  (
    partial:
      | Store
      | Partial<Store>
      | ((state: Store) => Store | Partial<Store>),
    replace?: false
  ): void;
  (state: Store | ((state: Store) => Store), replace: true): void;
  (arg0: { userInfo: User }): any;
}) => ({
  userInfo: undefined,
  setUserInfo: (userInfo: User) => set({ userInfo }),
});

const MoveSlice = (set: any, get: any) => ({
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
}); */

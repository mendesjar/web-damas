import { User } from "@/resources";
import { create } from "zustand";

type Store = {
  userInfo: User | undefined;
  setUserInfo: (user: User) => void;
};

export const AuthSlice = create<Store>()((set) => ({
  userInfo: undefined,
  setUserInfo: (userInfo: User) => set({ userInfo }),
}));

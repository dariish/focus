import { create } from "zustand";

type UIStore = {
  openSideBar: boolean;
  toggleSideBar: () => void;
};

export const useUIStore = create<UIStore>((set, get) => ({
  openSideBar: true,
  toggleSideBar: () => {
    const isOpen = get().openSideBar;
    set({ openSideBar: !isOpen });
  },
}));

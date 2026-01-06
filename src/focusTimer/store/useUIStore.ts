import { create } from "zustand";

export type SideTheme =
  | "dark"
  | "light"
  | "Lagoon"
  | "Dotted Purple"
  | "Dark Nature"
  | "Sunset";
export type ThemeColor = { type: SideTheme; colors: string[] };

const allThemes: ThemeColor[] = [
  {
    type: "dark",
    colors: ["#121519", "#0b0e14", "#888888"],
  },
  {
    type: "light",
    colors: ["#ffffff", "#f1f5f9", "#3b82f6"],
  },
  {
    type: "Lagoon",
    colors: ["#083344", "#0e7490", "#22d3ee"],
  },
  {
    type: "Dotted Purple",
    colors: ["#2e1065", "#7c3aed", "#d8b4fe"],
  },
  {
    type: "Dark Nature",
    colors: ["#022c22", "#065f46", "#34d399"],
  },
  {
    type: "Sunset",
    colors: ["#4c1d95", "#f97316", "#fbbf24"],
  },
];

type UIStore = {
  openSideBar: boolean;
  setSideBarOpen: (open: boolean) => void;
  theme: ThemeColor;
  allThemes: ThemeColor[];
  changeTheme: (theme: SideTheme) => void;
};

export const useUIStore = create<UIStore>()((set, get) => ({
  openSideBar: true,
  setSideBarOpen: (open: boolean) => {
    set({ openSideBar: open });
  },
  theme: allThemes[0],
  allThemes,
  changeTheme: (theme: SideTheme) => {
    const themeColor = allThemes.find((t) => t.type === theme);
    if (themeColor) {
      set({ theme: themeColor });
    }
  },
}));

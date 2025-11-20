import { create } from "zustand";

export type ModeFocusTime = "free" | "break" | "nobreak";

type TimerStore = {
  initTime: number;
  prevInitTime: number;
  mode: ModeFocusTime;
  prevMode: ModeFocusTime;
  activeTemplate: number;
  templates: {
    focusTime: number;
    smallBreakTime: number;
    bigBreakTime: number;
    sequence: number;
  }[];
  changeMode: (val: ModeFocusTime) => void;
  changeInitTime: (val: number) => void;
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  initTime: 255,
  prevInitTime: 1500,
  mode: "break",
  prevMode: "break",
  activeTemplate: 0,
  templates: [
    { focusTime: 1500, smallBreakTime: 300, bigBreakTime: 600, sequence: 4 },
  ],
  changeMode: (val: ModeFocusTime) => {
    const prev = get();
    console.log("prev.prevInitTime");
    console.log(prev.prevInitTime);
    let nextMode: ModeFocusTime = val;

    if (val === prev.mode) {
      if (val === "break") nextMode = "nobreak";
      else if (val === "nobreak") nextMode = "break";
      else if (val === "free") nextMode = prev.prevMode;
    }

    const updates: Partial<TimerStore> = {};
    if (nextMode === "free") {
      updates.prevMode = prev.mode;
      updates.prevInitTime = prev.initTime;
      updates.initTime = 0;
    } else if (prev.mode === "free") {
      updates.initTime = prev.prevInitTime || 1500;
    }

    set({
      mode: nextMode,
      ...updates,
    });
  },
  changeInitTime: (val: number) => {
    const prev = get();
    const updates: Partial<TimerStore> = { initTime: val };

    if (val === 0 && prev.mode !== "free") {
      updates.prevMode = prev.mode;
      updates.mode = "free";
    } else if (prev.mode === "free" && val !== 0) {
      updates.mode = prev.prevMode;
    }
    set(updates);
  },
}));

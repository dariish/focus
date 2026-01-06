import { create } from "zustand";

type TimerPlayerStore = {
  isRunning: boolean;
  lastStartedAt: number; // seconds since epoch
  accumulatedTime: number; // in seconds
  isPaused: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  finishTimer: () => void;
  skipToTime: (targetTime: number) => void; // Skip to a specific accumulated time
};
export const useTimePlayerStore = create<TimerPlayerStore>((set, get) => ({
  isRunning: false,
  lastStartedAt: Math.floor(Date.now() / 1000),
  accumulatedTime: 0,
  isPaused: false,
  startTimer: () => {
    set({
      isRunning: true,
      lastStartedAt: Math.floor(Date.now() / 1000),
      isPaused: false,
    });
  },
  pauseTimer: () => {
    const prev = get();
    const now = Math.floor(Date.now() / 1000);
    const acc = prev.accumulatedTime + (now - prev.lastStartedAt);

    set({ lastStartedAt: 0, isPaused: true, accumulatedTime: acc });
  },
  finishTimer: () => {
    set({
      isRunning: false,
      lastStartedAt: Math.floor(Date.now() / 1000),
      accumulatedTime: 0,
    });
  },
  skipToTime: (targetTime: number) => {
    const prev = get();
    const now = Math.floor(Date.now() / 1000);
    set({
      accumulatedTime: targetTime,
      lastStartedAt:
        prev.isRunning && !prev.isPaused ? now : prev.lastStartedAt,
    });
  },
}));

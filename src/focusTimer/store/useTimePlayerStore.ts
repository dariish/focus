import { create } from "zustand";
import { get, set } from "idb-keyval";
import { useStatsStore } from "./useStatsStore";

type TimerPlayerStore = {
  isRunning: boolean;
  lastStartedAt: number;
  accumulatedTime: number;
  isPaused: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  finishTimer: () => void;
  skipToTime: (targetTime: number) => void;
};

const STORAGE_KEY = "time-player-store-persist";

type PersistedState = {
  isRunning: boolean;
  lastStartedAt: number;
  accumulatedTime: number;
  isPaused: boolean;
  savedAt: number;
};

async function loadPersistedState(): Promise<Partial<PersistedState> | null> {
  try {
    const saved = await get<PersistedState>(STORAGE_KEY);
    return saved || null;
  } catch (error) {
    console.error("Error loading persisted timer state:", error);
    return null;
  }
}

async function savePersistedState(state: Partial<PersistedState>) {
  try {
    const toSave: PersistedState = {
      ...state,
      savedAt: Math.floor(Date.now() / 1000),
    } as PersistedState;
    await set(STORAGE_KEY, toSave);
  } catch (error) {
    console.error("Error saving persisted timer state:", error);
  }
}

export const useTimePlayerStore = create<TimerPlayerStore>((set, get) => {
  // Helper to save state
  const saveState = () => {
    const state = get();
    const toSave: PersistedState = {
      isRunning: state.isRunning,
      lastStartedAt: state.lastStartedAt,
      accumulatedTime: state.accumulatedTime,
      isPaused: state.isPaused,
      savedAt: Math.floor(Date.now() / 1000),
    };
    savePersistedState(toSave);
  };

  // Load persisted state and apply it
  loadPersistedState().then((saved) => {
    if (saved) {
      const now = Math.floor(Date.now() / 1000);
      const timeSinceSave = saved.savedAt ? now - saved.savedAt : 0;

      // If timer was running and not paused when saved, account for elapsed time
      if (
        saved.isRunning &&
        !saved.isPaused &&
        saved.lastStartedAt !== undefined &&
        saved.lastStartedAt > 0
      ) {
        const elapsedTime = timeSinceSave;
        const baseAccumulatedTime = saved.accumulatedTime ?? 0;
        const newAccumulatedTime = baseAccumulatedTime + elapsedTime;

        set({
          isRunning: saved.isRunning,
          lastStartedAt: now, // Reset to current time
          accumulatedTime: newAccumulatedTime,
          isPaused: saved.isPaused ?? false,
        });
      } else {
        // Timer was paused or not running, restore as-is
        set({
          isRunning: saved.isRunning ?? false,
          lastStartedAt: saved.lastStartedAt ?? Math.floor(Date.now() / 1000),
          accumulatedTime: saved.accumulatedTime ?? 0,
          isPaused: saved.isPaused ?? false,
        });
      }
    }
  });

  return {
    isRunning: false,
    lastStartedAt: Math.floor(Date.now() / 1000),
    accumulatedTime: 0,
    isPaused: false,
    startTimer: () => {
      const prev = get();
      set({
        isRunning: true,
        lastStartedAt: Math.floor(Date.now() / 1000),
        isPaused: false,
      });
      saveState();
      // Start stats session (only if not already running, or if resuming from pause)
      if (!prev.isRunning || prev.isPaused) {
        useStatsStore.getState().startSession();
      }
    },
    pauseTimer: () => {
      const prev = get();
      const now = Math.floor(Date.now() / 1000);
      const acc = prev.accumulatedTime + (now - prev.lastStartedAt);

      set({ lastStartedAt: 0, isPaused: true, accumulatedTime: acc });
      saveState();
      // End stats session when paused (only if there's an active session)
      const statsStore = useStatsStore.getState();
      if (statsStore.activeSessionId) {
        statsStore.endSession();
      }
    },
    finishTimer: () => {
      set({
        isRunning: false,
        isPaused: false,
        lastStartedAt: Math.floor(Date.now() / 1000),
        accumulatedTime: 0,
      });
      saveState();
      // End stats session (only if there's an active session)
      const statsStore = useStatsStore.getState();
      if (statsStore.activeSessionId) {
        statsStore.endSession();
      }
    },
    skipToTime: (targetTime: number) => {
      const prev = get();
      const now = Math.floor(Date.now() / 1000);
      set({
        accumulatedTime: targetTime,
        lastStartedAt:
          prev.isRunning && !prev.isPaused ? now : prev.lastStartedAt,
      });
      saveState();
    },
  };
});

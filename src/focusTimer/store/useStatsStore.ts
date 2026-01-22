import { create } from "zustand";
import { get, set } from "idb-keyval";

// Work session: tracks a single work period
export type WorkSession = {
  id: string;
  startTime: number; // Unix timestamp in seconds
  endTime: number | null; // Unix timestamp in seconds, null if still active
  date: string; // YYYY-MM-DD format
};

type StatsStore = {
  sessions: WorkSession[];
  activeSessionId: string | null;
  
  // Actions
  startSession: () => void;
  endSession: () => void;
  
  // Getters
  getTotalTimeToday: () => number; // Returns seconds
  getTotalTimeThisWeek: () => number; // Returns seconds
  getTotalTimeThisMonth: () => number; // Returns seconds
  getTodaySessions: () => WorkSession[]; // Returns sessions for today with time ranges
};

const STORAGE_KEY = "stats-store-persist";

async function loadPersistedState(): Promise<WorkSession[]> {
  try {
    const saved = await get<WorkSession[]>(STORAGE_KEY);
    return saved || [];
  } catch (error) {
    console.error("Error loading persisted stats state:", error);
    return [];
  }
}

async function savePersistedState(sessions: WorkSession[]) {
  try {
    await set(STORAGE_KEY, sessions);
  } catch (error) {
    console.error("Error saving persisted stats state:", error);
  }
}

// Helper to get date string (YYYY-MM-DD)
function getDateString(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().split("T")[0];
}

// Helper to get start of week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(d);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

// Helper to get start of month
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export const useStatsStore = create<StatsStore>((set, get) => {
  // Load persisted state
  loadPersistedState().then((sessions) => {
    // Find active session (one without endTime)
    const activeSession = sessions.find((s) => s.endTime === null);
    set({
      sessions,
      activeSessionId: activeSession?.id || null,
    });
  });

  return {
    sessions: [],
    activeSessionId: null,

    startSession: () => {
      const now = Math.floor(Date.now() / 1000);
      const sessionId = `session-${now}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newSession: WorkSession = {
        id: sessionId,
        startTime: now,
        endTime: null,
        date: getDateString(now),
      };

      set((state) => {
        const updatedSessions = [...state.sessions, newSession];
        savePersistedState(updatedSessions);
        return {
          sessions: updatedSessions,
          activeSessionId: sessionId,
        };
      });
    },

    endSession: () => {
      const now = Math.floor(Date.now() / 1000);
      
      set((state) => {
        if (!state.activeSessionId) {
          return state;
        }

        const updatedSessions = state.sessions.map((session) => {
          if (session.id === state.activeSessionId) {
            return {
              ...session,
              endTime: now,
            };
          }
          return session;
        });

        savePersistedState(updatedSessions);
        return {
          sessions: updatedSessions,
          activeSessionId: null,
        };
      });
    },

    getTotalTimeToday: () => {
      const today = getDateString(Math.floor(Date.now() / 1000));
      const sessions = get().sessions.filter((s) => s.date === today && s.endTime !== null);
      
      return sessions.reduce((total, session) => {
        if (session.endTime) {
          return total + (session.endTime - session.startTime);
        }
        return total;
      }, 0);
    },

    getTotalTimeThisWeek: () => {
      const today = new Date();
      const weekStart = getWeekStart(today);
      const weekStartStr = getDateString(Math.floor(weekStart.getTime() / 1000));
      const todayStr = getDateString(Math.floor(Date.now() / 1000));

      const sessions = get().sessions.filter(
        (s) => s.date >= weekStartStr && s.date <= todayStr && s.endTime !== null
      );

      return sessions.reduce((total, session) => {
        if (session.endTime) {
          return total + (session.endTime - session.startTime);
        }
        return total;
      }, 0);
    },

    getTotalTimeThisMonth: () => {
      const today = new Date();
      const monthStart = getMonthStart(today);
      const monthStartStr = getDateString(Math.floor(monthStart.getTime() / 1000));
      const todayStr = getDateString(Math.floor(Date.now() / 1000));

      const sessions = get().sessions.filter(
        (s) => s.date >= monthStartStr && s.date <= todayStr && s.endTime !== null
      );

      return sessions.reduce((total, session) => {
        if (session.endTime) {
          return total + (session.endTime - session.startTime);
        }
        return total;
      }, 0);
    },

    getTodaySessions: () => {
      const today = getDateString(Math.floor(Date.now() / 1000));
      return get().sessions
        .filter((s) => s.date === today && s.endTime !== null)
        .sort((a, b) => a.startTime - b.startTime);
    },
  };
});

import { create } from "zustand";
import { get, set } from "idb-keyval";

export type SideTheme =
  | "dark"
  | "light"
  | "Lagoon"
  | "Dotted Purple"
  | "Dark Nature"
  | "Sunset";

export type ThemeColor = { type: SideTheme; colors: string[] };
export type TimerFormat = "h:m" | "m" | "h:m:s" | "m:s";
export type TimerObject = "plant" | "character" | "beer" | "";
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

export const allSounds = [
  { label: "Default", value: "notification-ping-1.mp3" },
  { label: "Minimalistic", value: "notification-ping-2.mp3" },
  { label: "Classic", value: "notification-ping-3.mp3" },
  { label: "Modern", value: "notification-ping-4.mp3" },
];
export type PlayerDesign = "Default" | "Minimalistic";

const STORAGE_KEY = "ui-store-persist";

type PersistedState = {
  theme: SideTheme;
  showTimer: boolean;
  activeTimerFormat: TimerFormat;
  activeTimerObject: TimerObject;
  activePlayerDesign: PlayerDesign;
  showSequenceSkips: boolean;
  showAllSequences: boolean;
  showSound: boolean;
  activeSound: string;
  showNotifications: boolean;
};

async function loadPersistedState(): Promise<Partial<PersistedState> | null> {
  try {
    const saved = await get<PersistedState>(STORAGE_KEY);
    return saved || null;
  } catch (error) {
    console.error("Error loading persisted state:", error);
    return null;
  }
}

async function savePersistedState(state: Partial<PersistedState>) {
  try {
    await set(STORAGE_KEY, state);
  } catch (error) {
    console.error("Error saving persisted state:", error);
  }
}

type UIStore = {
  openSideBar: boolean;
  setSideBarOpen: (open: boolean) => void;
  theme: ThemeColor;
  allThemes: ThemeColor[];
  changeTheme: (theme: SideTheme) => void;
  showTimer: boolean;
  toggleTimer: () => void;
  activeTimerFormat: TimerFormat;
  setTimerFormat: (format: TimerFormat) => void;
  activeTimerObject: TimerObject;
  setTimerObject: (object: TimerObject) => void;
  activePlayerDesign: PlayerDesign;
  setPlayerDesign: (design: PlayerDesign) => void;
  showSequenceSkips: boolean;
  toggleSequenceSkips: () => void;
  showAllSequences: boolean;
  toggleAllSequences: () => void;
  showSound: boolean;
  toggleSound: () => void;
  activeSound: string;
  setActiveSound: (sound: string) => void;
  showNotifications: boolean;
  toggleNotifications: () => void;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<void>;
  openWindow: boolean;
  popupWindow: Window | null;
  useFloatingOverlay: boolean; // Use floating overlay instead of popup window
  toggleWindow: () => void;
  setPopupWindow: (window: Window | null) => void;
  setUseFloatingOverlay: (use: boolean) => void;
};

export const useUIStore = create<UIStore>()((set, get) => {
  // Initialize notification permission
  let initialPermission: NotificationPermission = "default";
  if (typeof Notification !== "undefined") {
    initialPermission = Notification.permission;
  }

  // Default values
  const defaults = {
    theme: allThemes[0],
    showTimer: true,
    activeTimerFormat: "m" as TimerFormat,
    activeTimerObject: "plant" as TimerObject,
    activePlayerDesign: "Default" as PlayerDesign,
    showSequenceSkips: true,
    showAllSequences: true,
    showSound: true,
    activeSound: "notification-ping-1.mp3",
    showNotifications: false,
  };

  // Helper to save state
  const saveState = () => {
    const state = get();
    const toSave: PersistedState = {
      theme: state.theme.type,
      showTimer: state.showTimer,
      activeTimerFormat: state.activeTimerFormat,
      activeTimerObject: state.activeTimerObject,
      activePlayerDesign: state.activePlayerDesign,
      showSequenceSkips: state.showSequenceSkips,
      showAllSequences: state.showAllSequences,
      showSound: state.showSound,
      activeSound: state.activeSound,
      showNotifications: state.showNotifications,
    };
    savePersistedState(toSave);
  };

  // Load persisted state and apply it
  loadPersistedState().then((saved) => {
    if (saved) {
      const updates: Partial<UIStore> = {};

      if (saved.theme) {
        const themeColor = allThemes.find((t) => t.type === saved.theme);
        if (themeColor) {
          updates.theme = themeColor;
        }
      }

      if (saved.showTimer !== undefined) updates.showTimer = saved.showTimer;
      if (saved.activeTimerFormat)
        updates.activeTimerFormat = saved.activeTimerFormat;
      if (saved.activeTimerObject !== undefined)
        updates.activeTimerObject = saved.activeTimerObject;
      if (saved.activePlayerDesign)
        updates.activePlayerDesign = saved.activePlayerDesign;
      if (saved.showSequenceSkips !== undefined)
        updates.showSequenceSkips = saved.showSequenceSkips;
      if (saved.showAllSequences !== undefined)
        updates.showAllSequences = saved.showAllSequences;
      if (saved.showSound !== undefined) updates.showSound = saved.showSound;
      if (saved.activeSound) updates.activeSound = saved.activeSound;
      if (saved.showNotifications !== undefined)
        updates.showNotifications = saved.showNotifications;

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    }
  });

  return {
    openSideBar: true,
    setSideBarOpen: (open: boolean) => {
      set({ openSideBar: open });
    },
    theme: defaults.theme,
    allThemes,
    changeTheme: (theme: SideTheme) => {
      const themeColor = allThemes.find((t) => t.type === theme);
      if (themeColor) {
        set({ theme: themeColor });
        saveState();
      }
    },
    showTimer: defaults.showTimer,
    toggleTimer: () => {
      set({ showTimer: !get().showTimer });
      saveState();
    },
    activeTimerFormat: defaults.activeTimerFormat,
    setTimerFormat: (format: TimerFormat) => {
      set({ activeTimerFormat: format });
      saveState();
    },
    activeTimerObject: defaults.activeTimerObject,
    setTimerObject: (object: TimerObject) => {
      set({ activeTimerObject: object });
      saveState();
    },
    activePlayerDesign: defaults.activePlayerDesign,
    setPlayerDesign: (design: PlayerDesign) => {
      set({ activePlayerDesign: design });
      saveState();
    },
    showSequenceSkips: defaults.showSequenceSkips,
    toggleSequenceSkips: () => {
      set({ showSequenceSkips: !get().showSequenceSkips });
      saveState();
    },
    showAllSequences: defaults.showAllSequences,
    toggleAllSequences: () => {
      set({ showAllSequences: !get().showAllSequences });
      saveState();
    },
    showSound: defaults.showSound,
    toggleSound: () => {
      set({ showSound: !get().showSound });
      saveState();
    },
    activeSound: defaults.activeSound,
    setActiveSound: (sound: string) => {
      set({ activeSound: sound });
      saveState();
    },
    showNotifications: defaults.showNotifications,
    toggleNotifications: () => {
      set({ showNotifications: !get().showNotifications });
      saveState();
    },
    notificationPermission: initialPermission,
    requestNotificationPermission: async () => {
      if (typeof Notification === "undefined") {
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        set({ notificationPermission: permission });
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    },
    openWindow: false,
    popupWindow: null,
    useFloatingOverlay: false, // Use popup window so it can be dragged anywhere on screen
    toggleWindow: () => {
      const currentState = get();
      if (currentState.openWindow) {
        // Close window/overlay
        if (currentState.popupWindow) {
          try {
            currentState.popupWindow.close();
          } catch (e) {
            // Window might already be closed
          }
        }
        set({ openWindow: false, popupWindow: null });
      } else {
        if (currentState.useFloatingOverlay) {
          // Use floating overlay (no browser chrome, but limited to browser window)
          set({ openWindow: true, popupWindow: null });
        } else {
          // Open popup window with minimal chrome (can be dragged anywhere on screen)
          const popupUrl = `${window.location.origin}/popup.html`;
          const popup = window.open(
            popupUrl,
            "timer-popup",
            "width=320,height=100,resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,status=no,titlebar=no"
          );
          if (popup) {
            set({ openWindow: true, popupWindow: popup });
          }
        }
      }
    },
    setPopupWindow: (window: Window | null) => {
      set({ popupWindow: window });
    },
    setUseFloatingOverlay: (use: boolean) => {
      set({ useFloatingOverlay: use });
    },
  };
});

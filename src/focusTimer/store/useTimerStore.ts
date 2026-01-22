import { create } from "zustand";
import { get, set } from "idb-keyval";

export type Template = {
  id: number;
  title: string;
  focusTime: number;
  smallBreakTime: number;
  bigBreakTime: number;
  sequence: number;
  canBeDeleted?: boolean;
};

export type TemplateForm = {
  title: string;
  focusTime: number;
  smallBreakTime: number;
  bigBreakTime: number;
  sequence: number;
};

type TimerStore = {
  currentTime: number;
  prevTime: number;
  mode: boolean;
  break: boolean;
  activeTemplate: number;
  templates: Template[];
  changeMode: () => void;
  changeBreak: () => void;
  changeCurrentTime: (val: number) => void;
  changeActiveTemplate: (id: number) => void;
  addTemplate: (temp: TemplateForm) => void;
  deleteTemplate: (id: number) => void;
};

//indexDB save this: currentTime, prevTime, mode, break, activeTemplate, templates

const STORAGE_KEY = "timer-store-persist";

type PersistedState = {
  currentTime: number;
  prevTime: number;
  mode: boolean;
  break: boolean;
  activeTemplate: number;
  templates: Template[];
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
    await set(STORAGE_KEY, state);
  } catch (error) {
    console.error("Error saving persisted timer state:", error);
  }
}

export const useTimerStore = create<TimerStore>((set, get) => {
  // Throttle for currentTime saves (save at most every 5 seconds)
  let currentTimeSaveTimeout: ReturnType<typeof setTimeout> | null = null;
  const CURRENT_TIME_THROTTLE_MS = 5000; // 5 seconds

  // Helper to save state with throttling for currentTime
  const saveState = (includeCurrentTime = false) => {
    const state = get();
    const toSave: PersistedState = {
      currentTime: state.currentTime,
      prevTime: state.prevTime,
      mode: state.mode,
      break: state.break,
      activeTemplate: state.activeTemplate,
      templates: state.templates,
    };

    if (includeCurrentTime) {
      // Save immediately with currentTime
      savePersistedState(toSave);
    } else {
      // Throttle currentTime saves
      if (currentTimeSaveTimeout) {
        clearTimeout(currentTimeSaveTimeout);
      }
      currentTimeSaveTimeout = setTimeout(() => {
        savePersistedState(toSave);
        currentTimeSaveTimeout = null;
      }, CURRENT_TIME_THROTTLE_MS);
    }
  };

  // Load persisted state and apply it
  loadPersistedState().then((saved) => {
    if (saved) {
      const updates: Partial<TimerStore> = {};

      if (saved.currentTime !== undefined)
        updates.currentTime = saved.currentTime;
      if (saved.prevTime !== undefined) updates.prevTime = saved.prevTime;
      if (saved.mode !== undefined) updates.mode = saved.mode;
      if (saved.break !== undefined) updates.break = saved.break;
      if (saved.activeTemplate !== undefined)
        updates.activeTemplate = saved.activeTemplate;
      if (saved.templates) updates.templates = saved.templates;

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    }
  });

  return {
    currentTime: 2550,
    prevTime: 1500,
    mode: true,
    break: true,
    activeTemplate: 0,
    templates: [
      {
        id: 0,
        title: "Pomodoro",
        focusTime: 1500,
        smallBreakTime: 300,
        bigBreakTime: 600,
        sequence: 4,
        canBeDeleted: false,
      },
      {
        id: 1,
        title: "52/17 Rule",
        focusTime: 3120,
        smallBreakTime: 1020,
        bigBreakTime: 0,
        sequence: 0,
        canBeDeleted: false,
      },
      {
        id: 2,
        title: "Flowtime",
        focusTime: 1800,
        smallBreakTime: 600,
        bigBreakTime: 0,
        sequence: 0,
        canBeDeleted: false,
      },
    ],
    changeMode: () => {
      const prev = get();

      const updates: Partial<TimerStore> = {};
      updates.mode = !prev.mode;
      if (updates.mode) {
        updates.prevTime = prev.currentTime;
        updates.currentTime = 0;
      } else {
        updates.currentTime = prev.prevTime || 1500;
      }
      set({
        ...updates,
      });
      saveState(true);
    },
    changeBreak: () => {
      const prev = get();
      const updates: Partial<TimerStore> = {};
      updates.break = !prev.break;
      set({
        ...updates,
      });
      saveState(true);
    },
    changeCurrentTime: (val: number) => {
      const prev = get();
      const updates: Partial<TimerStore> = { currentTime: val };

      if (val === 0 && !prev.mode) {
        updates.mode = true;
      } else if (val !== 0 && prev.mode) {
        updates.mode = false;
      }
      set(updates);
      saveState(false);
    },
    changeActiveTemplate: (id: number) => {
      set({ activeTemplate: id });
      saveState(true);
    },
    addTemplate: (temp: TemplateForm) => {
      const prev = get();

      const newTemplate: Template = {
        id: Date.now() + prev.templates.length,
        title: temp.title,
        focusTime: temp.focusTime * 60,
        smallBreakTime: temp.smallBreakTime * 60,
        bigBreakTime: temp.bigBreakTime * 60,
        sequence: temp.sequence,
        canBeDeleted: true,
      };

      set({ templates: [...prev.templates, newTemplate] });
      saveState(true);
    },
    deleteTemplate: (id: number) => {
      const prev = get();
      let newActiveTemplate = prev.activeTemplate;
      if (prev.activeTemplate === id) {
        newActiveTemplate = 0;
      }
      const newTemplates = prev.templates.filter((temp) => temp.id !== id);
      set({ templates: newTemplates, activeTemplate: newActiveTemplate });
      saveState(true);
    },
  };
});

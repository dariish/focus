import { create } from "zustand";

export type ModeFocusTime = "free" | "break" | "nobreak";

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
  newInitTime: number;
  prevInitTime: number;
  mode: ModeFocusTime;
  prevMode: ModeFocusTime;
  activeTemplate: number;
  templates: Template[];
  changeMode: (val: ModeFocusTime) => void;
  changeInitTime: (val: number) => void;
  changeActiveTemplate: (id: number) => void;
  addTemplate: (temp: TemplateForm) => void;
  deleteTemplate: (id: number) => void;
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  currentTime: 255,
  newInitTime: 255,
  prevInitTime: 1500,
  mode: "break",
  prevMode: "break",
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
  changeMode: (val: ModeFocusTime) => {
    const prev = get();
    let nextMode: ModeFocusTime = val;

    if (val === prev.mode) {
      if (val === "break") nextMode = "nobreak";
      else if (val === "nobreak") nextMode = "break";
      else if (val === "free") nextMode = prev.prevMode;
    }

    const updates: Partial<TimerStore> = {};
    if (nextMode === "free") {
      updates.prevMode = prev.mode;
      updates.prevInitTime = prev.currentTime;
      updates.currentTime = 0;
      updates.newInitTime = 0;
    } else if (prev.mode === "free") {
      updates.currentTime = prev.prevInitTime || 1500;
      updates.newInitTime = prev.prevInitTime || 1500;
    }

    set({
      mode: nextMode,
      ...updates,
    });
  },
  changeInitTime: (val: number) => {
    const prev = get();
    const updates: Partial<TimerStore> = { currentTime: val };

    if (val === 0 && prev.mode !== "free") {
      updates.prevMode = prev.mode;
      updates.mode = "free";
    } else if (prev.mode === "free" && val !== 0) {
      updates.mode = prev.prevMode;
    }
    set(updates);
  },
  changeActiveTemplate: (id: number) => {
    console.log("changeActiveTemplate", id);
    set({ activeTemplate: id });
  },
  addTemplate: (temp: TemplateForm) => {
    const prev = get();

    const newTemplate: Template = {
      id: prev.templates.length + 1,
      title: temp.title
        ? temp.title
        : "Template " + (prev.templates.length + 1),
      focusTime: 1500,
      smallBreakTime: 300,
      bigBreakTime: 600,
      sequence: 4,
      canBeDeleted: true,
    };

    set({ templates: [...prev.templates, newTemplate] });
  },
  deleteTemplate: (id: number) => {
    console.log("deleteTemplate");
    const prev = get();
    let newActiveTemplate = prev.activeTemplate;
    if (prev.activeTemplate === id) {
      newActiveTemplate = 0;
    }
    console.log("newActiveTemplate", newActiveTemplate);
    const newTemplates = prev.templates.filter((temp) => temp.id !== id);
    set({ templates: newTemplates, activeTemplate: newActiveTemplate });
  },
}));

useTimerStore.subscribe((state, prevState) => {
  console.log("Previous:", prevState);
  console.log("Current:", state);
});

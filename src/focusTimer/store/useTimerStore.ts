import { create } from "zustand";

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

export const useTimerStore = create<TimerStore>((set, get) => ({
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
  },
  changeBreak: () => {
    const prev = get();
    const updates: Partial<TimerStore> = {};
    updates.break = !prev.break;
    set({
      ...updates,
    });
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
  },
  changeActiveTemplate: (id: number) => {
    set({ activeTemplate: id });
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
  },
  deleteTemplate: (id: number) => {
    const prev = get();
    let newActiveTemplate = prev.activeTemplate;
    if (prev.activeTemplate === id) {
      newActiveTemplate = 0;
    }
    const newTemplates = prev.templates.filter((temp) => temp.id !== id);
    set({ templates: newTemplates, activeTemplate: newActiveTemplate });
  },
}));

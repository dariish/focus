import { create } from "zustand";
import { useProjectStore } from "./useProjectStore";

export type Task = {
  id: number;
  title: string;
  idProject: number;
};
type TimeTasksStore = {
  tasks: Task[];
  archivedTasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: number) => void;
  editTask: (id: number, title: string) => void;
  activeTask: number;
  archiveTask: (id: number) => void;
  unarchiveTask: (id: number) => void;
  setTasks: (tasks: Task[]) => void;
  setArchivedTasks: (tasks: Task[]) => void;
  moveTaskToTop: (id: number) => void;
};

// Helper function to find a project by ID (checks both active and archived)
const findProject = (projectId: number) => {
  const projectStore = useProjectStore.getState();
  return (
    projectStore.projects.find((p) => p.id === projectId) ||
    projectStore.archivedProjects.find((p) => p.id === projectId)
  );
};

// Helper function to update project countTasks
const updateProjectCount = (projectId: number, delta: number) => {
  const project = findProject(projectId);
  if (project) {
    const updatedProject = {
      ...project,
      countTasks: Math.max(0, (project.countTasks || 0) + delta),
    };
    useProjectStore.getState().updateProject(projectId, updatedProject);
  }
};

export const useTimeTasksStore = create<TimeTasksStore>()((set, get) => ({
  tasks: [],
  archivedTasks: [],
  addTask: (task: Task) => {
    const prev = get();
    const projectStore = useProjectStore.getState();

    // Always increment General project (id: 0, index 0)
    const generalProject = projectStore.projects[0];
    if (generalProject && generalProject.id === 0) {
      updateProjectCount(0, 1);
    }

    // Increment the task's assigned project if it's not General
    if (task.idProject !== 0) {
      updateProjectCount(task.idProject, 1);
    }

    set({ tasks: [task, ...prev.tasks] });
  },
  deleteTask: (id: number) => {
    const store = get();
    const taskToDelete =
      store.tasks.find((task) => task.id === id) ||
      store.archivedTasks.find((task) => task.id === id);

    if (taskToDelete) {
      const projectStore = useProjectStore.getState();

      // Always decrement General project (id: 0, index 0)
      const generalProject = projectStore.projects[0];
      if (generalProject && generalProject.id === 0) {
        updateProjectCount(0, -1);
      }

      // Decrement the task's assigned project if it's not General
      if (taskToDelete.idProject !== 0) {
        updateProjectCount(taskToDelete.idProject, -1);
      }
    }

    const updatedTasks = store.tasks.filter((task) => task.id !== id);
    const updatedArchivedTasks = store.archivedTasks.filter(
      (task) => task.id !== id
    );
    set({ tasks: updatedTasks, archivedTasks: updatedArchivedTasks });
  },
  editTask: (id: number, title: string) => {
    const store = get();
    // Update task in tasks array
    const updatedTasks = store.tasks.map((task) =>
      task.id === id ? { ...task, title } : task
    );
    // Update task in archivedTasks array if it exists there
    const updatedArchivedTasks = store.archivedTasks.map((task) =>
      task.id === id ? { ...task, title } : task
    );
    set({
      tasks: updatedTasks,
      archivedTasks: updatedArchivedTasks,
    });
  },
  activeTask: 0,
  archiveTask: (id: number) => {
    const task = get().tasks.find((task) => task.id === id);
    if (task) {
      set({ archivedTasks: [task, ...get().archivedTasks] });
      set({ tasks: get().tasks.filter((task) => task.id !== id) });
    }
  },
  unarchiveTask: (id: number) => {
    const task = get().archivedTasks.find((task) => task.id === id);
    if (task) {
      set({ tasks: [...get().tasks, task] });
      set({
        archivedTasks: get().archivedTasks.filter((task) => task.id !== id),
      });
    }
  },
  setTasks: (tasks: Task[]) => {
    set({ tasks });
  },
  setArchivedTasks: (tasks: Task[]) => {
    set({ archivedTasks: tasks });
  },
  moveTaskToTop: (id: number) => {
    const store = get();
    // Check if task is in tasks array
    const taskInTasks = store.tasks.find((task) => task.id === id);
    if (taskInTasks) {
      const otherTasks = store.tasks.filter((task) => task.id !== id);
      set({ tasks: [taskInTasks, ...otherTasks] });
      return;
    }
    // Check if task is in archivedTasks array
    const taskInArchived = store.archivedTasks.find((task) => task.id === id);
    if (taskInArchived) {
      const otherArchived = store.archivedTasks.filter(
        (task) => task.id !== id
      );
      set({ archivedTasks: [taskInArchived, ...otherArchived] });
    }
  },
}));

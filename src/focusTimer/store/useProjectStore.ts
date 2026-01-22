import { create } from "zustand";
import { get, set } from "idb-keyval";

export type ProjectType = {
  id: number;
  title: string;
  color: string;
  countTasks: number;
};

export type ProjectForm = {
  title: string;
  color: string;
};
type ProjectStore = {
  projects: ProjectType[];
  setProjects: (projects: ProjectType[]) => void;
  addProject: (project: ProjectForm) => void;
  deleteProject: (id: number) => void;
  updateProject: (id: number, project: ProjectType) => void;
  activeProject: number;
  changeActiveProject: (id: number) => void;
  archivedProjects: ProjectType[];
  setArchivedProjects: (projects: ProjectType[]) => void;
  archiveProject: (id: number) => void;
  unarchiveProject: (id: number) => void;
};

const STORAGE_KEY = "project-store-persist";

type PersistedState = {
  projects: ProjectType[];
  activeProject: number;
  archivedProjects: ProjectType[];
};

async function loadPersistedState(): Promise<Partial<PersistedState> | null> {
  try {
    const saved = await get<PersistedState>(STORAGE_KEY);
    return saved || null;
  } catch (error) {
    console.error("Error loading persisted project state:", error);
    return null;
  }
}

async function savePersistedState(state: Partial<PersistedState>) {
  try {
    await set(STORAGE_KEY, state);
  } catch (error) {
    console.error("Error saving persisted project state:", error);
  }
}

// Default values
const defaultProjects: ProjectType[] = [
  { id: 0, title: "General", color: "#f0b000 ", countTasks: 0 },
];

export const useProjectStore = create<ProjectStore>()((set, get) => {
  // Helper to save state
  const saveState = () => {
    const state = get();
    const toSave: PersistedState = {
      projects: state.projects,
      activeProject: state.activeProject,
      archivedProjects: state.archivedProjects,
    };
    savePersistedState(toSave);
  };

  // Load persisted state and apply it
  loadPersistedState().then((saved) => {
    if (saved) {
      const updates: Partial<ProjectStore> = {};

      if (saved.projects) updates.projects = saved.projects;
      if (saved.activeProject !== undefined)
        updates.activeProject = saved.activeProject;
      if (saved.archivedProjects)
        updates.archivedProjects = saved.archivedProjects;

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    }
  });

  return {
    projects: defaultProjects,
    setProjects: (projects: ProjectType[]) => {
      set({ projects });
      saveState();
    },
    addProject: (project: ProjectForm) => {
      const newProject: ProjectType = {
        ...project,
        countTasks: 0,
        id: Date.now() + get().projects.length + 1,
      };
      set({ projects: [...get().projects, newProject] });
      saveState();
    },
    deleteProject: (id: number) => {
      set({
        projects: get().projects.filter((project) => project.id !== id),
        archivedProjects: get().archivedProjects.filter(
          (project) => project.id !== id
        ),
      });
      if (get().activeProject === id) {
        set({ activeProject: 0 });
      }
      saveState();
    },
    updateProject: (id: number, updatedProject: ProjectType) => {
      const isArchived = get().archivedProjects.some(
        (project) => project.id === id
      );

      if (isArchived) {
        set({
          archivedProjects: get().archivedProjects.map((project) =>
            project.id === id ? updatedProject : project
          ),
        });
      } else {
        set({
          projects: get().projects.map((project) =>
            project.id === id ? updatedProject : project
          ),
        });
      }
      saveState();
    },
    activeProject: 0,
    changeActiveProject: (id: number) => {
      console.log("changeActiveProject", id);
      set({ activeProject: id });
      saveState();
    },
    archivedProjects: [],
    setArchivedProjects: (archivedProjects: ProjectType[]) => {
      set({ archivedProjects });
      saveState();
    },
    archiveProject: (id: number) => {
      const projectToArchive = get().projects.find(
        (project) => project.id === id
      );
      if (id === get().activeProject) {
        set({ activeProject: 0 });
      }
      if (projectToArchive) {
        set({
          archivedProjects: [projectToArchive, ...get().archivedProjects],
          projects: get().projects.filter((project) => project.id !== id),
        });
      }
      saveState();
    },
    unarchiveProject: (id: number) => {
      const projectToUnarchive = get().archivedProjects.find(
        (project) => project.id === id
      );
      set({
        archivedProjects: get().archivedProjects.filter(
          (project) => project.id !== id
        ),
        projects: [...get().projects, projectToUnarchive as ProjectType],
      });
      saveState();
    },
  };
});

import { create } from "zustand";

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

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [
    { id: 0, title: "General", color: "#f0b000 ", countTasks: 0 },
    { id: 1, title: "Project 2", color: "#000000", countTasks: 55 },
    { id: 2, title: "Project 3", color: "#000000", countTasks: 0 },
    { id: 3, title: "Project 4", color: "#000000", countTasks: 0 },
    { id: 4, title: "Project 5", color: "#000000", countTasks: 0 },
    { id: 5, title: "Project 6", color: "#000000", countTasks: 0 },
    { id: 6, title: "Project 7", color: "#000000", countTasks: 0 },
    { id: 7, title: "Project 8", color: "#000000", countTasks: 0 },
    { id: 8, title: "Project 9", color: "#000000", countTasks: 0 },
    { id: 9, title: "Project 10", color: "#000000", countTasks: 0 },
    { id: 10, title: "Project 11", color: "#000000", countTasks: 0 },
    { id: 11, title: "Project 12", color: "#000000", countTasks: 0 },
    { id: 12, title: "Project 13", color: "#000000", countTasks: 0 },
    { id: 13, title: "Project 14", color: "#000000", countTasks: 0 },
  ],
  setProjects: (projects: ProjectType[]) => {
    set({ projects });
  },
  addProject: (project: ProjectForm) => {
    const newProject: ProjectType = {
      ...project,
      countTasks: 0,
      id: Date.now() + get().projects.length + 1,
    };
    set({ projects: [...get().projects, newProject] });
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
  },
  activeProject: 0,
  changeActiveProject: (id: number) => {
    console.log("changeActiveProject", id);
    set({ activeProject: id });
  },
  archivedProjects: [],
  setArchivedProjects: (archivedProjects: ProjectType[]) => {
    set({ archivedProjects });
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
  },
}));

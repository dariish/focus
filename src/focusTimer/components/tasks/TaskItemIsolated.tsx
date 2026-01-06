import { useTimeTasksStore } from "../../store/useTimeTasksStore";
import { useProjectStore } from "../../store/useProjectStore";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../../config/routes";

export default function TaskItemIsolated() {
  const navigate = useNavigate();

  const activeProject = useProjectStore((s) => s.activeProject);
  const projects = useProjectStore((s) => s.projects);
  const archivedProjects = useProjectStore((s) => s.archivedProjects);
  let project = null;
  const tasks = useTimeTasksStore((s) => s.tasks);

  let firstTask = null;
  if (activeProject === 0) {
    //When its in general Folder Project
    firstTask = tasks[0];
  } else {
    //Normal Behaviour
    project = projects.find((p) => p.id === activeProject);
    firstTask = tasks.find((task) => task.idProject === activeProject);
  }

  if (!project) {
    project =
      projects.find((p) => p.id === firstTask?.idProject) ||
      archivedProjects.find((p) => p.id === firstTask?.idProject);
  }

  const projectColor = project?.color || "#f0b000";
  const cleanHex = "#" + projectColor.replace("#", "").trim().slice(0, 6);

  function handleClick() {
    navigate(`/${PATHS.SIDEPAGE.TASKS.ROOT}`);
    const timeoutId = setTimeout(() => {
      document
        .getElementById("time-tasks-list")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }

  if (!firstTask) {
    return (
      <div
        onClick={handleClick}
        className="max-w-[180px] bg-main-400 duration-300 cursor-pointer relative flex items-center gap-3 border border-stroke-500 rounded-sm py-1.5 pl-3 pr-3 text-tertiary-400"
      >
        <div
          className="absolute inset-0 w-20 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, 
            ${cleanHex}30 0%, 
            ${cleanHex}00 53%
          )`,
          }}
        />
        <div
          className="min-w-4 min-h-4 rounded-sm border"
          style={{ borderColor: cleanHex }}
        ></div>
        No Tasks Active
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="max-w-[600px] min-w-[100px] group bg-main-400 hover:bg-main-500 hover:border-main-800 duration-300 cursor-pointer relative flex items-center gap-3 border border-stroke-500 rounded-sm py-1.5 pl-3 pr-4 break-all"
    >
      <div
        className="absolute inset-0 w-20 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, 
            ${cleanHex}30 0%, 
            ${cleanHex}00 53%
          )`,
        }}
      />
      <div
        className="min-w-4 min-h-4 rounded-sm border"
        style={{ borderColor: cleanHex }}
      ></div>
      {firstTask.title}
    </div>
  );
}

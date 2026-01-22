import { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaFolderPlus, FaPlus, FaRegEdit } from "react-icons/fa";
import { IoIosArrowForward, IoIosKeypad } from "react-icons/io";
import { MdArrowUpward } from "react-icons/md";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { useTimeTasksStore, type Task } from "../../store/useTimeTasksStore";
import SideProjects from "./SideProjects";
import { useProjectStore, type ProjectType } from "../../store/useProjectStore";
import { MdAddBox, MdDragIndicator, MdDeleteForever } from "react-icons/md";
import { PiListDashesFill } from "react-icons/pi";
import { CheckBoxItem } from "../../../shared/inputs/CheckBoxItem";
import FolderIcon from "../../../assets/folder.svg?react";

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  type DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ButtonSelectPopup from "../ui/ButtonSelectPopup";

function AddTaskForm({
  currentActiveProject,
}: {
  currentActiveProject: number;
}) {
  const [taskName, setTaskName] = useState({ value: "", error: "" });
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const addTask = useTimeTasksStore((s) => s.addTask);

  useEffect(() => {
    if (showAddTaskForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddTaskForm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowAddTaskForm(false);
      }
    }

    if (showAddTaskForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddTaskForm]);

  function handleAddTask() {
    if (taskName.value.trim() === "") {
      setTaskName({ value: "", error: " " });
      return;
    }
    addTask({
      id: Date.now(),
      title: taskName.value,
      idProject: currentActiveProject,
    });
    setTaskName({ value: "", error: "" });
  }
  function handleTaskNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTaskName({ value: e.target.value, error: "" });
  }

  return (
    <div
      ref={formRef}
      className={`relative overflow-hidden cursor-pointer duration-250 outline outline-dashed rounded-sm text-tertiary-400 ${
        showAddTaskForm ? "outline-stroke-500" : "outline-stroke-500/50"
      }`}
    >
      <div
        onClick={() => setShowAddTaskForm(true)}
        className="flex items-center gap-2 py-3 px-4"
      >
        <FaPlus size={10} className="fill-tertiary-400 min-w-3 min-h-3" />
        {showAddTaskForm ? (
          <>
            <input
              ref={inputRef}
              className="w-full  border-none outline-none mr-10 bg-transparent text-tertiary-500"
              type="text"
              placeholder="Task Name"
              value={taskName.value}
              onChange={(e) => handleTaskNameChange(e)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                }
              }}
              maxLength={130}
            />
            <button
              onClick={handleAddTask}
              className="group bg-main-650 rounded-xs aspect-square px-2 absolute right-1 top-1 bottom-1 flex items-center justify-center"
            >
              <MdAddBox className="fill-stroke-600 group-hover:fill-tertiary-500 cursor-pointer w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <span>New Task</span>
            <div className="flex items-center gap-1 ml-auto">
              <span className="border rounded border-stroke-500 aspect-square w-4 h-4 flex items-center justify-center p-px">
                <IoIosKeypad
                  className={` ${
                    showAddTaskForm ? "fill-tertiary-500" : "fill-tertiary-400"
                  }`}
                />
              </span>
              <span className="border rounded border-stroke-500 aspect-square w-4 h-4 flex items-center justify-center text-xs font-bold text-tertiary-400">
                T
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TaskItemContent({
  task,
  isArchived = false,
  color,
  isDragging = false,
  dragListeners,
  firstItem = false,
}: {
  task: Task;
  isArchived?: boolean;
  color: string;
  isDragging?: boolean;
  dragListeners?: any;
  firstItem?: boolean;
}) {
  const archiveTask = useTimeTasksStore((s) => s.archiveTask);
  const unarchiveTask = useTimeTasksStore((s) => s.unarchiveTask);
  const editTask = useTimeTasksStore((s) => s.editTask);
  const deleteTask = useTimeTasksStore((s) => s.deleteTask);
  const moveTaskToTop = useTimeTasksStore((s) => s.moveTaskToTop);
  const [currentColor, setCurrentColor] = useState(color);
  const [isEditing, setIsEditing] = useState(false);
  const [taskTitle, setTaskTitle] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { refs, floatingStyles, context } = useFloating({
    open: showMenu,
    onOpenChange: setShowMenu,
    middleware: [offset(2), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-end",
  });

  const click = useClick(context, { event: "mousedown" });
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  useEffect(() => {
    if (!color) {
      const project = useProjectStore
        .getState()
        .projects.find((project) => project.id === task.idProject);
      if (project) {
        setCurrentColor(project.color);
      }
    }
  }, [color, task.idProject]);

  useEffect(() => {
    setTaskTitle(task.title);
  }, [task.title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        if (taskTitle.trim() !== "" && taskTitle !== task.title) {
          editTask(task.id, taskTitle.trim());
        } else if (taskTitle.trim() === "") {
          setTaskTitle(task.title);
        }
        setIsEditing(false);
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, taskTitle, task.title, task.id, editTask]);

  function handleSave() {
    if (taskTitle.trim() !== "" && taskTitle !== task.title) {
      editTask(task.id, taskTitle.trim());
    } else if (taskTitle.trim() === "") {
      setTaskTitle(task.title); // Reset to original if empty
    }
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTaskTitle(task.title); // Reset to original
      setIsEditing(false);
    }
  }

  function handleTaskDone() {
    if (!isArchived) {
      archiveTask(task.id);
    } else {
      unarchiveTask(task.id);
    }
  }
  const cleanHex = "#" + currentColor.replace("#", "").slice(0, 6);
  return (
    <li
      className={`group relative flex duration-250 overflow-hidden items-center gap-1 outline outline-stroke-500 rounded-xs  ${
        isDragging ? "opacity-50" : ""
      }  ${isArchived ? "outline-stroke-500/40!" : ""}`}
    >
      <div
        className={`px-1 group/drag cursor-grab  duration-200 `}
        {...dragListeners}
      >
        <MdDragIndicator className="fill-tertiary-400/20 group-active/drag:fill-tertiary-500 group-hover/drag:fill-tertiary-400 " />
      </div>

      <div
        className="absolute inset-0 w-1/4 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, 
            ${cleanHex}${isArchived ? "10" : "30"} 0%, 
            ${cleanHex}00 53%
          )`,
        }}
      />
      <CheckBoxItem
        checked={isArchived}
        onChange={handleTaskDone}
        colorVariant={cleanHex}
        size={23}
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          className={`ml-3 border-none outline-none bg-transparent w-full ${
            isArchived ? "text-tertiary-400" : "text-tertiary-500"
          }`}
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className={`ml-3 mr-1 cursor-text py-1 break-all font-light ${
            isArchived ? "line-through text-tertiary-400" : "text-tertiary-500"
          }`}
        >
          {task.title}
        </p>
      )}
      {firstItem && !isArchived && (
        <div className="flex justify-center items-center p-0.5 aspect-square w-4 h-4 bg-main-700 ml-auto rounded-xs">
          <MdArrowUpward className="fill-tertiary-500 " />
        </div>
      )}
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onClick: (e) => e.stopPropagation(),
          onMouseDown: (e) => e.stopPropagation(),
        })}
        className={`${
          !firstItem || isArchived ? "ml-auto" : ""
        } group/three px-2 rounded-xs m-1 aspect-square flex items-center justify-center duration-200 cursor-pointer border border-transparent ${
          showMenu ? "bg-main-300 border-stroke-500!" : "hover:bg-main-300/30"
        }`}
      >
        <BsThreeDotsVertical
          className={`${
            showMenu
              ? "fill-tertiary-500"
              : "fill-tertiary-400/20 group-hover/three:fill-tertiary-500"
          }`}
        />
      </button>
      <AnimatePresence>
        {showMenu && (
          <FloatingPortal
            root={
              (document.querySelector(".timer-widget") as HTMLElement) ||
              undefined
            }
          >
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-50 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.7, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="flex flex-col bg-main-300 border border-stroke-500 rounded-sm shadow-xl min-w-[120px]">
                    {!firstItem && !isArchived && (
                      <ButtonSelectPopup
                        title="To Top"
                        icon={
                          <MdArrowUpward className="fill-tertiary-500 w-3 h-3" />
                        }
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          moveTaskToTop(task.id);
                          setShowMenu(false);
                        }}
                      />
                    )}

                    <ButtonSelectPopup
                      title="Edit"
                      icon={<FaRegEdit className="fill-tertiary-500 w-3 h-3" />}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                    />

                    <div className="h-px w-full bg-stroke-500/80" />

                    <ButtonSelectPopup
                      title="Delete"
                      icon={
                        <MdDeleteForever className="fill-red-400 w-3 h-3" />
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                        setShowMenu(false);
                      }}
                      className="text-red-400! hover:bg-red-500/10! hover:text-red-300!"
                    />
                  </div>
                </motion.div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </li>
  );
}

function SortableTaskItem({
  task,
  isArchived = false,
  color,
  firstItem = false,
}: {
  task: Task;
  isArchived?: boolean;
  color: string;
  firstItem: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task, isArchived },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskItemContent
        task={task}
        isArchived={isArchived}
        color={color}
        isDragging={isDragging}
        dragListeners={listeners}
        firstItem={firstItem}
      />
    </div>
  );
}

function ProjectSelectPopup({
  projects,
  activeProject,
  changeActiveProject,
}: {
  projects: ProjectType[];
  activeProject: number;
  changeActiveProject: (id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const currentProject = projects.find((p) => p.id === activeProject);
  const isNone = activeProject === 0;
  // Filter out the "General" project (id: 0) from the list
  const filteredProjects = projects.filter((p) => p.id !== 0);

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="flex items-center gap-2 bg-main-600 py-1 px-2 rounded cursor-pointer hover:bg-main-700 transition-colors duration-200"
      >
        {!isNone && (
          <FolderIcon
            className="w-3 h-3"
            style={{ color: currentProject?.color || "#f0b000" }}
          />
        )}
        <span>{isNone ? "None" : currentProject?.title || "None"}</span>
        <IoIosArrowForward
          size={12}
          className={`ml-auto transition-transform duration-250 fill-tertiary-400 mt-0.5 ${
            isOpen ? "rotate-270" : "rotate-90"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal
            root={
              (document.querySelector(".timer-widget") as HTMLElement) ||
              undefined
            }
          >
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-50 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 5 }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                  }}
                >
                  <div className="flex flex-col bg-main-300 border border-stroke-500 rounded-sm shadow-xl min-w-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                    {/* None option */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        changeActiveProject(0);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-2 mx-0.5 my-0.5 rounded-xs px-2 py-1.5 text-sm text-left  transition-colors ${
                        isNone ? "bg-stroke-500/25" : "hover:bg-main-400"
                      }`}
                    >
                      <span className="flex-1">None</span>
                    </button>
                    {/* Other projects */}
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          changeActiveProject(project.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 mx-0.5 my-0.5 rounded-xs px-2 py-1.5 text-sm text-left  transition-colors ${
                          activeProject === project.id
                            ? "bg-stroke-500/25"
                            : "hover:bg-main-400"
                        }`}
                      >
                        <FolderIcon
                          className="w-3 h-3 shrink-0"
                          style={{ color: project.color }}
                        />
                        <span className="flex-1">{project.title}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </>
  );
}

export default function SideTasks() {
  const activeProject = useProjectStore((s) => s.activeProject);
  const tasks = useTimeTasksStore((s) => s.tasks);
  const archivedTasks = useTimeTasksStore((s) => s.archivedTasks);
  const setTasks = useTimeTasksStore((s) => s.setTasks);
  const setArchivedTasks = useTimeTasksStore((s) => s.setArchivedTasks);
  const projects = useProjectStore((s) => s.projects);
  const changeActiveProject = useProjectStore((s) => s.changeActiveProject);
  const [showSideProject, setShowSideProject] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  let filteredTasks = tasks;
  let filteredArchivedTasks = archivedTasks;
  let color = "";

  if (activeProject !== 0) {
    filteredTasks = tasks.filter((task) => task.idProject === activeProject);
    filteredArchivedTasks = archivedTasks.filter(
      (task) => task.idProject === activeProject
    );
    color =
      projects.find((project) => project.id === activeProject)?.color || "";
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Prevent cross-list dragging
    if (activeData?.isArchived !== overData?.isArchived) {
      return;
    }

    const isArchived = activeData?.isArchived || false;

    if (isArchived) {
      // Reorder within filtered archived tasks
      const oldIndex = filteredArchivedTasks.findIndex(
        (t) => t.id === activeId
      );
      const newIndex = filteredArchivedTasks.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex && newIndex !== -1) {
        const reorderedFiltered = arrayMove(
          filteredArchivedTasks,
          oldIndex,
          newIndex
        );
        // Update store: if filtering by project, merge with other projects' tasks
        if (activeProject !== 0) {
          const store = useTimeTasksStore.getState();
          const otherArchived = store.archivedTasks.filter(
            (t) => t.idProject !== activeProject
          );
          // Maintain relative order: other projects first, then reordered project tasks
          setArchivedTasks([...otherArchived, ...reorderedFiltered]);
        } else {
          // No filtering, update entire list
          setArchivedTasks(reorderedFiltered);
        }
      }
    } else {
      // Reorder within filtered tasks
      const oldIndex = filteredTasks.findIndex((t) => t.id === activeId);
      const newIndex = filteredTasks.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex && newIndex !== -1) {
        const reorderedFiltered = arrayMove(filteredTasks, oldIndex, newIndex);
        // Update store: if filtering by project, merge with other projects' tasks
        if (activeProject !== 0) {
          const store = useTimeTasksStore.getState();
          const otherTasks = store.tasks.filter(
            (t) => t.idProject !== activeProject
          );
          // Maintain relative order: other projects first, then reordered project tasks
          setTasks([...otherTasks, ...reorderedFiltered]);
        } else {
          // No filtering, update entire list
          setTasks(reorderedFiltered);
        }
      }
    }
  }

  const activeTaskIds = filteredTasks.map((t) => t.id);
  const archivedTaskIds = filteredArchivedTasks.map((t) => t.id);

  return (
    <section>
      <BreadCrumb
        className="py-2 border-y border-stroke-500/40 mb-10"
        items={[{ title: "Tasks" }]}
      />
      <AnimatePresence mode="wait">
        {showSideProject && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <SideProjects />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-tertiary-400 flex items-center text-sm font-light mb-4 py-2 border-t border-b border-stroke-500/40 border-dashed">
        <span className="flex items-center gap-2">
          <FolderIcon className="w-3 h-3 text-yellow-500" />
          general
          <span>/</span>
          <ProjectSelectPopup
            projects={projects}
            activeProject={activeProject}
            changeActiveProject={changeActiveProject}
          />
        </span>
        <div
          onClick={() => setShowSideProject((prev) => !prev)}
          className={`ml-auto p-3 border border-stroke-500 bg-main-600 rounded-xs cursor-pointer hover:bg-main-700 duration-200 ${
            showSideProject ? "bg-main-700" : ""
          }`}
        >
          <FaFolderPlus className="text-yellow-500" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-4 ">
        <AddTaskForm currentActiveProject={activeProject} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div>
            {filteredTasks.length > 0 || filteredArchivedTasks.length > 0 ? (
              <div className="flex flex-col gap-2" id="time-tasks-list">
                {filteredTasks.length > 0 && (
                  <SortableContext
                    items={activeTaskIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="flex flex-col gap-2">
                      {filteredTasks.map((task, index) => (
                        <SortableTaskItem
                          firstItem={index === 0}
                          color={color}
                          key={task.id}
                          task={task}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                )}
                {filteredArchivedTasks.length > 0 && (
                  <SortableContext
                    items={archivedTaskIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="flex flex-col gap-2">
                      {filteredArchivedTasks.map((task, index) => (
                        <SortableTaskItem
                          firstItem={index === 0}
                          color={color}
                          key={task.id}
                          task={task}
                          isArchived={true}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-stroke-500/20 rounded-sm px-4 py-20  text-lg text-tertiary-400 font-light">
                <PiListDashesFill className="w-16 h-16 duration-300 fill-tertiary-400" />
                Tasks list is empty.
              </div>
            )}
          </div>
        </DndContext>
      </div>
    </section>
  );
}

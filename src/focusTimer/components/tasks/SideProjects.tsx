import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import FolderIcon from "../../../assets/folder.svg?react";
import { TbLayoutDashboard, TbLayoutList } from "react-icons/tb";
import SearchInput from "../../../shared/inputs/SearchInput";
import { useProjectStore, type ProjectType } from "../../store/useProjectStore";
import { createPortal } from "react-dom";
import {
  DndContext,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  closestCorners,
  TouchSensor,
  MouseSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { AnimatePresence } from "motion/react";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ProjectSotableItem, ProjectItem } from "./ProjectSotableItem";
import SideFormProjects from "./SideFormProjects";
import { FaPlus, FaRegEdit } from "react-icons/fa";
import SideSectionHeader from "../ui/SideSectionHeader";
import SideSectionMid from "../ui/SideSectionMid";

function ActiveDropArea({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: "active-drop-area",
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[50px] transition-colors rounded ${
        layout
          ? "grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-2"
          : "flex flex-col gap-1"
      }`}
    >
      {children}
    </div>
  );
}

function ArchivedDropArea({
  children,
  empty,
}: {
  children: React.ReactNode;
  empty: boolean;
}) {
  const { setNodeRef} = useDroppable({
    id: "archived-drop-area",
    disabled: !empty,
  });

  return (
    <div ref={setNodeRef} className={`col-span-full transition-colors `}>
      {children}
    </div>
  );
}

export default function SideProjects() {
  const [projectLayout, setProjectLayout] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDragItem, setActiveDragItem] = useState<ProjectType | null>(
    null
  );
  const [editProject, setEditProject] = useState<ProjectType | null>(null);
  const [showFormProject, setShowFormProject] = useState(0);

  const projects = useProjectStore((state) => state.projects);
  const setProjects = useProjectStore((state) => state.setProjects);
  const archivedProjects = useProjectStore((state) => state.archivedProjects);
  const setArchivedProjects = useProjectStore(
    (state) => state.setArchivedProjects
  );
  const changeActiveProject = useProjectStore(
    (state) => state.changeActiveProject
  );
  const activeProject = useProjectStore((state) =>
    state.projects.find((p) => p.id === state.activeProject)
  );

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

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    let item = active.data.current?.project;

    // Fallback to ID lookup if data is missing
    if (!item) {
      const activeId = Number(active.id);
      item =
        projects.find((p) => p.id === activeId) ||
        archivedProjects.find((p) => p.id === activeId);
    }

    if (item) {
      setActiveDragItem(item);
    }
  }

  function findContainer(
    id: number | string | null
  ): "active" | "archived" | null {
    if (!id) return null;
    if (id === "archived-drop-area") return "archived";
    if (id === "active-drop-area") return "active";
    const numId = Number(id);
    if (projects.some((p) => p.id === numId)) return "active";
    if (archivedProjects.some((p) => p.id === numId)) return "archived";
    return null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    if (activeId === Number(overId)) return; // Hovering self

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    // We are crossing containers
    const item = active.data.current?.project || activeDragItem;
    if (!item) return;

    if (activeContainer === "active" && overContainer === "archived") {
      if (activeProject?.id === activeId) {
        changeActiveProject(0);
      }
      setProjects(projects.filter((p) => p.id !== activeId));

      const newArchived = [...archivedProjects];
      // Check if over a specific item or the drop area
      if (overId !== "archived-drop-area") {
        const overIndex = archivedProjects.findIndex(
          (p) => p.id === Number(overId)
        );
        if (overIndex >= 0) newArchived.splice(overIndex, 0, item);
        else newArchived.push(item);
      } else {
        newArchived.push(item);
      }
      setArchivedProjects(newArchived);
    } else if (activeContainer === "archived" && overContainer === "active") {
      setArchivedProjects(archivedProjects.filter((p) => p.id !== activeId));

      const newProjects = [...projects];
      if (overId === "active-drop-area") {
        newProjects.push(item);
      } else {
        const overIndex = projects.findIndex((p) => p.id === Number(overId));
        if (overIndex >= 0) newProjects.splice(overIndex, 0, item);
        else newProjects.push(item);
      }

      setProjects(newProjects);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    if (activeId === Number(overId)) return;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      // Reorder within same container
      const numOverId = Number(overId);
      if (activeContainer === "active") {
        const oldIndex = projects.findIndex((p) => p.id === activeId);
        const newIndex = projects.findIndex((p) => p.id === numOverId);
        if (newIndex === 0) return; // Prevent before General
        if (oldIndex !== newIndex) {
          setProjects(arrayMove(projects, oldIndex, newIndex));
        }
      } else {
        // archived
        if (overId === "archived-drop-area") return;
        const oldIndex = archivedProjects.findIndex((p) => p.id === activeId);
        const newIndex = archivedProjects.findIndex((p) => p.id === numOverId);
        if (oldIndex !== newIndex) {
          setArchivedProjects(arrayMove(archivedProjects, oldIndex, newIndex));
        }
      }
    }
  }

  function handleProjectClick(id: number) {
    if (activeProject?.id === id) {
      changeActiveProject(0);
      return;
    }
    changeActiveProject(id);
  }

  function handleProjectEditClick(project: ProjectType) {
    setShowFormProject(2);
    setEditProject(project);
    scrollToForm();
  }
  function scrollToForm() {
    setTimeout(() => {
      const element = document.getElementById("side-form-projects");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);
  }

  function handleFormClose() {
    setShowFormProject(0);
    setEditProject(null);
  }

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArchivedProjects = archivedProjects.filter((project) =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SideSectionHeader
        title="Projects"
        showContainerProp={true}
        content={
          <span className="flex items-center gap-2">
            <FolderIcon
              className="w-4 h-4 text-yellow-500"
              style={{ color: activeProject?.color }}
            />
            {activeProject?.title}
          </span>
        }
      >
        <SideSectionMid containerClassName="flex-row items-center justify-between px-3 py-1.5">
          <SearchInput placeholder="Search Project" onChange={setSearch} />
          <span
            className="group p-1 rounded-xs border border-stroke-500 cursor-pointer hover:bg-main-700 duration-200"
            onClick={() => setProjectLayout((prev) => !prev)}
          >
            {projectLayout ? (
              <TbLayoutDashboard className="stroke-tertiary-400 group-hover:stroke-tertiary-500 duration-200" />
            ) : (
              <TbLayoutList className="stroke-tertiary-400 group-hover:stroke-tertiary-500 duration-200" />
            )}
          </span>
        </SideSectionMid>

        <div className="flex flex-col gap-4 relative">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SideSectionMid
              containerClassName="block! py-4 px-2 max-h-[420px] overflow-y-auto"
              bottomBorder={showFormProject !== 0}
            >
              <SortableContext
                items={filteredProjects
                  .filter((p) => p.id !== 0)
                  .map((p) => p.id)}
                strategy={
                  projectLayout
                    ? rectSortingStrategy
                    : verticalListSortingStrategy
                }
              >
                <ActiveDropArea layout={projectLayout}>
                  <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => (
                      <ProjectSotableItem
                        beingEdited={editProject?.id === project.id}
                        active={activeProject?.id === project.id}
                        onClick={() => handleProjectClick(project.id)}
                        key={project.id}
                        project={project}
                        layout={projectLayout}
                        onEditClick={handleProjectEditClick}
                      />
                    ))}
                  </AnimatePresence>
                  {projects.length <= 1 && (
                    <div
                      onClick={() => {
                        setEditProject(null);
                        setShowFormProject(1);
                        scrollToForm();
                      }}
                      className={` ${
                        projectLayout
                          ? "aspect-square justify-center flex-col px-1"
                          : `py-2 px-2 ml-2 text-sm`
                      } cursor-pointer flex items-center gap-2 text-center text-tertiary-400 hover:bg-main-550 duration-200 border border-stroke-500 rounded  `}
                    >
                      <FaPlus className="fill-tertiary-400" />
                      New Project
                    </div>
                  )}
                </ActiveDropArea>
              </SortableContext>

              <SortableContext
                items={filteredArchivedProjects.map((p) => p.id)}
                strategy={
                  projectLayout
                    ? rectSortingStrategy
                    : verticalListSortingStrategy
                }
              >
                <ArchivedDropArea empty={archivedProjects.length === 0}>
                  <div className="col-span-full my-4 flex items-center">
                    <span className="text-[11px] uppercase font-bold text-tertiary-400">
                      Archived
                    </span>
                    <span className="grow h-px bg-stroke-500 ml-4 rounded-full"></span>
                  </div>
                  <div
                    className={
                      projectLayout
                        ? "grid grid-cols-2 xs:grid-cols-4 gap-2"
                        : "flex flex-col gap-1"
                    }
                  >
                    <AnimatePresence mode="popLayout">
                      {archivedProjects.length > 0 &&
                        filteredArchivedProjects.map((project) => (
                          <ProjectSotableItem
                            beingEdited={editProject?.id === project.id}
                            active={activeProject?.id === project.id}
                            onClick={() => handleProjectClick(project.id)}
                            onEditClick={handleProjectEditClick}
                            key={project.id}
                            project={project}
                            layout={projectLayout}
                            archived={true}
                          />
                        ))}
                    </AnimatePresence>

                    <div
                      className={`${
                        archivedProjects.length === 0
                          ? "col-span-full row-span-2 text-sm"
                          : "col-span-1 row-span-1 text-xs"
                      } ${
                        projectLayout
                          ? "py-6 justify-center"
                          : `py-2 px-3  ${
                              archivedProjects.length === 0 ? "" : "ml-2"
                            }`
                      } flex items-center text-center  text-tertiary-400/50 font-light border border-dashed border-stroke-500/50 rounded  `}
                    >
                      Drop archived projects
                    </div>
                  </div>
                </ArchivedDropArea>
              </SortableContext>
            </SideSectionMid>
          </DndContext>
          {createPortal(
            <DragOverlay adjustScale={true}>
              {activeDragItem ? (
                <ProjectItem
                  active={activeProject?.id === activeDragItem.id}
                  onClick={() => {}}
                  project={activeDragItem}
                  layout={projectLayout}
                  isDragging={true}
                  onEditClick={handleProjectEditClick}
                />
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </div>

        <div
          className={`border-x border-stroke-500 bg-main-650 px-3 py-1 flex items-center  gap-2 ${
            showFormProject !== 0
              ? "border-t mt-1 rounded-t"
              : "rounded-b border-b "
          }`}
          onClick={() => {
            setEditProject(null);
            setShowFormProject((prev) => (prev === 0 ? 1 : 0));
          }}
        >
          <div
            className={`flex items-center gap-2 text-contrast-500 text-sm font-light   duration-200 rounded py-2 cursor-default `}
          >
            {showFormProject === 2 ? (
              <FaRegEdit className="fill-contrast-500 w-3 h-3" />
            ) : (
              <FaPlus className="fill-contrast-500 w-3 h-3" />
            )}

            {showFormProject === 0
              ? "Add New Project"
              : showFormProject === 1
              ? "Adding New Project"
              : `Editing ${editProject?.title}`}
          </div>
          {showFormProject === 0 ? (
            <>
              <span className="text-xs font-light text-tertiary-400/60 ml-auto">
                Archived{" "}
                <span className="text-tertiary-400">
                  {filteredArchivedProjects.length}
                </span>
              </span>
              <span className="text-xs font-light text-tertiary-400/60">
                Projects{" "}
                <span className="text-tertiary-400">
                  {filteredProjects.length}
                </span>
              </span>
            </>
          ) : (
            <IoIosArrowForward
              className={`ml-auto group-hover:scale-110 duration-250 fill-contrast-500 rotate-270`}
            />
          )}
        </div>
        <SideFormProjects
          showFormProject={showFormProject}
          setShowFormProject={handleFormClose}
          project={editProject ?? undefined}
        />
      </SideSectionHeader>
    </>
  );
}

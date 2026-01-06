import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MdDeleteForever, MdDragIndicator } from "react-icons/md";
import FolderIcon from "../../../assets/folder.svg?react";
import { useProjectStore, type ProjectType } from "../../store/useProjectStore";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useState } from "react";
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
  useMergeRefs,
} from "@floating-ui/react";
import { AnimatePresence, motion } from "motion/react";
import { FaRegEdit } from "react-icons/fa";
import { IoArchiveOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import ButtonDelete from "../ui/ButtonDelete";
import ButtonSelectPopup from "../ui/ButtonSelectPopup";
import ButtonCancel from "../ui/ButtonCancel";

export interface ProjectItemProps {
  project: ProjectType;
  layout: boolean;
  onClick: (id: number) => void;
  active: boolean;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
  isDragging?: boolean;
  archived?: boolean;
  onEditClick?: (project: ProjectType) => void;
  beingEdited?: boolean;
}

export function ProjectItem({
  project,
  layout,
  onClick,
  active,
  style,
  attributes,
  listeners,
  setNodeRef,
  isDragging,
  archived = false,
  onEditClick,
  beingEdited = false,
}: ProjectItemProps) {
  const isGeneral = project.id === 0;
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const archiveProject = useProjectStore((state) => state.archiveProject);
  const unarchiveProject = useProjectStore((state) => state.unarchiveProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);

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

  const {
    refs: deleteRefs,
    floatingStyles: deleteFloatingStyles,
    context: deleteContext,
  } = useFloating({
    open: showDeleteConfirm,
    onOpenChange: setShowDeleteConfirm,
    middleware: [offset(2), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-end",
  });

  const deleteDismiss = useDismiss(deleteContext);
  const deleteRole = useRole(deleteContext, { role: "dialog" });

  const { getFloatingProps: getDeleteFloatingProps } = useInteractions([
    deleteDismiss,
    deleteRole,
  ]);

  const triggerRef = useMergeRefs([refs.setReference, deleteRefs.setReference]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (archived) return;
    onClick(project.id);
  }

  function scrollIntoEditView(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      const element = document.getElementById("side-form-projects");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);
    if (project.countTasks <= 0) {
      deleteProject(project.id);
      notifyDelete(project.title);
    } else {
      setShowDeleteConfirm(true);
    }
  }

  const notifyDelete = (title: string) =>
    toast.success(`Project ${title} Deleted Successfully!`, {
      icon: <MdDeleteForever className="fill-red-400 w-full h-full" />,
      progressClassName: "!bg-red-500/60",
      className: "focus-alert-bg focus-toast-bg rounded-sm! shadow-xl",
    });

  return (
    <div
      onClick={handleClick}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(layout ? listeners : {})}
      className={`group relative flex items-center overflow-hidden  border cursor-default
        ${isDragging ? "" : "duration-200"}
        ${
          isGeneral
            ? " bg-main-550 hover:bg-main-650"
            : "bg-main-700 hover:bg-main-750  active:border-stroke-500"
        } 
       ${
         layout
           ? `p-2.5 gap-2 aspect-square rounded flex-col justify-center text-center ${
               isGeneral
                 ? "xs:col-span-2 xs:row-span-2 border-stroke-500/60 "
                 : " border-stroke-500 active:cursor-grabbing"
             } ${active ? " border-contrast-500!" : ""}`
           : `flex-row rounded-xs pl-2.5 ${
               isGeneral
                 ? "border-stroke-500/70 py-2.5 pl-3 mb-1"
                 : "border-stroke-500/40 ml-2 pl-3"
             } `
       } `}
    >
      {!layout && !isGeneral && (
        <div
          {...listeners}
          className="group/drag absolute left-px top-px bottom-px flex items-center p-1 justify-center  duration-200 cursor-grab active:cursor-grabbing  active:bg-stroke-500 rounded-xs "
        >
          <MdDragIndicator className="fill-tertiary-400/20 active:fill-tertiary-400 group-hover/drag:fill-tertiary-400 group-active/drag:fill-tertiary-500" />
        </div>
      )}
      <FolderIcon
        style={{ color: project.color }}
        className={` ${
          layout
            ? isGeneral
              ? "xs:w-16 xs:h-16 w-12 h-12"
              : "mt-1 w-10 h-10 xs:w-11 xs:h-11  md:w-10 md:h-10 xl:w-8 xl:h-8"
            : `w-3.5 h-3.5 mr-2 ${isGeneral ? "" : "ml-4"}`
        }`}
      />
      <span
        className={`text-tertiary-500 text-sm truncate  ${
          isGeneral && layout ? "text-xl font-medium xs:mt-2" : ""
        } ${
          layout
            ? "max-w-[120px] xs:max-w-none md:max-w-[110px] lg:max-w-[100px]"
            : ""
        }`}
      >
        {project.title}
      </span>
      <div
        className={`${
          layout ? "absolute top-2 left-2" : "ml-1 mt-0.5"
        } text-xs text-tertiary-400/50`}
      >
        {layout ? project.countTasks : `(${project.countTasks})`}
      </div>
      {beingEdited && (
        <div
          className={`flex items-center justify-center text-xs cursor-pointer rounded-xs px-2 ${
            layout ? "bg-main-500/70 inset-0 absolute py-1" : "ml-auto"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-contrast-500  ${
              layout
                ? "bg-main-500 p-2 rounded"
                : "hover:bg-main-500/20 bg-main-500/40 px-2 py-1 rounded-xs outline outline-main-500/40"
            }`}
            onClick={(e) => scrollIntoEditView(e)}
          >
            <FaRegEdit className="fill-contrast-500 w-3 h-3" />
            Editing
          </div>
        </div>
      )}
      {active && !layout && (
        <span
          className={`${
            !beingEdited ? "ml-auto" : ""
          } mr-2 text-xs bg-contrast-500 text-main-500 rounded-xs px-2 py-1 flex items-center`}
        >
          <span className="xs:inline hidden font-bold">active</span>
          <span className="xs:hidden">A</span>
        </span>
      )}
      {!isGeneral && (
        <>
          <button
            ref={triggerRef}
            {...getReferenceProps({
              onClick: (e) => e.stopPropagation(),
              onMouseDown: (e) => e.stopPropagation(),
            })}
            className={` duration-200  cursor-pointer border border-transparent flex items-center justify-center group/three z-10 ${
              layout
                ? "absolute top-px right-px py-1.5 px-1 rounded-sm"
                : `aspect-square px-2 rounded-sm py-2.5 ${
                    active || beingEdited ? "" : "ml-auto"
                  }`
            } ${
              showMenu || showDeleteConfirm
                ? "bg-main-300 border-stroke-500!"
                : "hover:bg-main-700"
            } `}
          >
            <BsThreeDotsVertical
              className={`${
                showMenu || showDeleteConfirm
                  ? "fill-tertiary-500"
                  : "fill-stroke-600 group-hover/three:fill-tertiary-500"
              }  `}
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
                    <div className=" flex flex-col bg-main-300 border border-stroke-500 rounded-sm shadow-xl min-w-[120px]">
                      {archived ? (
                        <ButtonSelectPopup
                          title={"restore"}
                          onClick={(e) => {
                            e.stopPropagation();
                            unarchiveProject(project.id);
                            setShowMenu(false);
                          }}
                          icon={
                            <IoArchiveOutline className="fill-tertiary-500 w-3 h-3 rotate-180" />
                          }
                        />
                      ) : (
                        <ButtonSelectPopup
                          title={active ? "Deactivate" : "Activate"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClick(project.id);
                            setShowMenu(false);
                          }}
                        />
                      )}
                      <ButtonSelectPopup
                        title="Edit"
                        icon={
                          <FaRegEdit className="fill-tertiary-500 w-3 h-3" />
                        }
                        onClick={() => {
                          onEditClick?.(project);
                          setShowMenu(false);
                        }}
                      />

                      <div className="h-px w-full bg-stroke-500/80" />
                      {!archived && (
                        <ButtonSelectPopup
                          title="Archive"
                          icon={
                            <IoArchiveOutline className="fill-tertiary-500 w-3 h-3" />
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            archiveProject(project.id);
                            setShowMenu(false);
                          }}
                        />
                      )}
                      <ButtonSelectPopup
                        title="Delete"
                        icon={
                          <MdDeleteForever className="fill-red-400 w-4 h-4 -mr-0.5" />
                        }
                        onClick={handleDelete}
                        className="text-red-400! hover:bg-red-500/10! hover:text-red-300!"
                      />
                    </div>
                  </div>
                </FloatingFocusManager>
              </FloatingPortal>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showDeleteConfirm && (
              <FloatingPortal
                root={
                  (document.querySelector(".timer-widget") as HTMLElement) ||
                  undefined
                }
              >
                <FloatingFocusManager context={deleteContext}>
                  <div
                    ref={deleteRefs.setFloating}
                    style={deleteFloatingStyles}
                    {...getDeleteFloatingProps()}
                    className="z-50 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", duration: 0.3 }}
                      className="  max-w-[330px] w-full"
                    >
                      <div className="bg-main-300 border-x border-t border-stroke-500 rounded-t shadow-xl pt-3 pb-1 px-3">
                        <p className="text-tertiary-500 text-sm mb-3">
                          There is{" "}
                          <span className="font-bold">
                            {project.countTasks}
                          </span>{" "}
                          tasks associated with this project.
                        </p>
                      </div>
                      <div className="flex flex-col bg-main-300 border-x border-b border-stroke-500 rounded-b shadow-xl pt-1 pb-3 px-3 mt-0.5">
                        <p className="text-tertiary-500 text-sm mb-4">
                          Are you sure you want to delete?
                        </p>
                        <div className="flex justify-start gap-2">
                          <ButtonCancel
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            Cancel
                          </ButtonCancel>
                          <ButtonDelete
                            onClick={() => {
                              deleteProject(project.id);
                              setShowDeleteConfirm(false);
                              notifyDelete(project.title);
                            }}
                          >
                            Delete Project
                          </ButtonDelete>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </FloatingFocusManager>
              </FloatingPortal>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

interface PropjectSortableItemProps {
  project: ProjectType;
  layout: boolean;
  onClick: (id: number) => void;
  active: boolean;
  archived?: boolean;
  onEditClick: (project: ProjectType) => void;
  beingEdited?: boolean;
}

export function ProjectSotableItem({
  project,
  layout,
  onClick,
  active,
  archived = false,
  onEditClick,
  beingEdited = false,
}: PropjectSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    disabled: project.id === 0,
    data: { project },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : archived ? 0.5 : 1,
    zIndex: isDragging ? 2 : "auto",
  };
  return (
    <ProjectItem
      project={project}
      layout={layout}
      onClick={onClick}
      active={active}
      style={style}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
      isDragging={isDragging}
      archived={archived}
      onEditClick={onEditClick}
      beingEdited={beingEdited}
    />
  );
}

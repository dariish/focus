import { useEffect, useState } from "react";
import { FaCheckCircle, FaPlus, FaRegEdit } from "react-icons/fa";
import Input from "../../../shared/inputs/Input";
import { motion, AnimatePresence } from "motion/react";
import ColorPickerPopup from "../../../shared/inputs/ColorPickerPopup";
import FolderIcon from "../../../assets/folder.svg?react";
import { toast } from "react-toastify";

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
import { useProjectStore, type ProjectType } from "../../store/useProjectStore";
import ButtonConfirm from "../ui/ButtonConfirm";
import SideSectionMid from "../ui/SideSectionMid";
import ButtonCancel from "../ui/ButtonCancel";

export default function SideFormProjects({
  showFormProject,
  project,
  setShowFormProject,
}: {
  showFormProject: number;
  project?: ProjectType | undefined;
  setShowFormProject: (show: number) => void;
}) {
  const addProject = useProjectStore((s) => s.addProject);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#f0b000");
  const [title, setTitle] = useState({
    value: "",
    error: "",
  });
  const updateProject = useProjectStore((s) => s.updateProject);

  const { refs, floatingStyles, context } = useFloating({
    open: showColorPicker,
    onOpenChange: setShowColorPicker,
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
    placement: "bottom-end",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  useEffect(() => {
    if (project && showFormProject === 2) {
      setSelectedColor(project.color);
      setTitle({ value: project.title, error: "" });
    } else {
      setTitle({ value: "", error: "" });
      setSelectedColor("#f0b000");
    }
  }, [showFormProject, project]);

  function handleAddProject(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (title.value.trim() === "") {
      setTitle({ value: "", error: " " });
      return;
    }
    addProject({ title: title.value, color: selectedColor });
    setShowFormProject(0);
    notifyAdd(title.value);
  }

  function handleUpdateProject(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (title.value.trim() === "") {
      setTitle({ value: "", error: " " });
      return;
    }
    if (!project) return;

    updateProject(project.id, {
      ...project,
      title: title.value,
      color: selectedColor,
    });
    setShowFormProject(0);
    notifyUpdate(title.value);
  }

  const notifyAdd = (title: string) =>
    toast.success(`${title} added Successfully!`, {
      icon: <FaCheckCircle className="fill-contrast-500 w-full h-full" />,
      progressClassName: "!bg-contrast-500",
      className: "focus-contrast-bg focus-toast-bg rounded-sm! shadow-xl",
    });

  const notifyUpdate = (title: string) =>
    toast.success(`${title} updated Successfully!`, {
      icon: <FaCheckCircle className="fill-contrast-500 w-full h-full" />,
      progressClassName: "!bg-contrast-500",
      className: "focus-contrast-bg focus-toast-bg rounded-sm! shadow-xl",
    });

  return (
    <>
      <AnimatePresence>
        {showFormProject !== 0 && (
          <motion.form
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            id="side-form-projects"
            className="overflow-hidden flex flex-col gap-0.5"
          >
            <SideSectionMid containerClassName="pt-6">
              <Input
                containerClassName="flex-row gap-2 items-center justify-between w-full"
                className="max-w-[220px]"
                label="Project Name"
                maxLength={16}
                labelClassName="text-tertiary-500 font-light! text-base! text-nowrap"
                placeholder="work, study, etc."
                value={title.value}
                onChange={(e) => setTitle({ value: e.target.value, error: "" })}
                error={title.error}
              />

              <div className="flex justify-between items-center gap-4 pt-4 relative">
                <span className="text-tertiary-500 font-light text-base text-nowrap">
                  Color
                </span>

                <div className="relative">
                  <button
                    ref={refs.setReference}
                    {...getReferenceProps({
                      onClick: (e) => e.preventDefault(),
                    })}
                    className="flex items-center justify-center gap-4 cursor-pointer duration-200 shadow-sm px-3 py-2 bg-main-750 rounded-sm border-b border-main-500 group hover:bg-main-800"
                  >
                    <div
                      className="w-6 h-6 border-2 border-main-750 rounded-lg group-hover:scale-110 duration-200"
                      style={{ backgroundColor: selectedColor }}
                    />
                    {selectedColor}
                  </button>

                  <AnimatePresence>
                    {showColorPicker && (
                      <FloatingPortal
                        root={
                          (document.querySelector(
                            ".timer-widget"
                          ) as HTMLElement) || undefined
                        }
                      >
                        <FloatingFocusManager context={context} modal={false}>
                          <div
                            ref={refs.setFloating}
                            style={floatingStyles}
                            {...getFloatingProps()}
                            className="z-50 focus:outline-none"
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
                              <ColorPickerPopup
                                onClose={() => setShowColorPicker(false)}
                                initialColor={selectedColor}
                                onChange={(val: string) => {
                                  setSelectedColor(val);
                                }}
                                label="Project Color"
                                recentColors={[
                                  "#3b82f6",
                                  "#ef4444",
                                  "#10b981",
                                  "#f59e0b",
                                  "#8b5cf6",
                                ]}
                              />
                            </motion.div>
                          </div>
                        </FloatingFocusManager>
                      </FloatingPortal>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="h-px w-full bg-stroke-500/30 mt-5" />

              <div
                className={`relative flex flex-col gap-2 items-center bg-main-700 rounded p-4 mt-5 square-bg ${
                  title ? "animate-square-bg" : ""
                }`}
              >
                <span className="absolute top-2 left-2 text-xs text-tertiary-400 bg-main-700/90 rounded-xs px-2 py-1">
                  Preview
                </span>
                <FolderIcon
                  style={{ color: selectedColor }}
                  className="w-16 h-16"
                />
                <span className="text-tertiary-500">
                  {title.value ? title.value : "-"}
                </span>
              </div>
            </SideSectionMid>

            <SideSectionMid
              containerClassName="flex justify-end flex-row gap-2"
              bottomBorder={true}
            >
              <ButtonCancel
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  setShowFormProject(0);
                }}
                className="px-5 text-base!"
              >
                Cancel
              </ButtonCancel>

              <ButtonConfirm
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (showFormProject === 2 && project) {
                    handleUpdateProject(e);
                  } else {
                    handleAddProject(e);
                  }
                }}
              >
                {showFormProject === 2 ? (
                  <>
                    <FaRegEdit
                      size={11}
                      className="fill-tertiary-500 group-hover:scale-110 duration-200"
                    />
                    Save Project
                  </>
                ) : (
                  <>
                    <FaPlus
                      size={12}
                      className="fill-tertiary-500 group-hover:scale-110 duration-200"
                    />
                    Save New Project
                  </>
                )}
              </ButtonConfirm>
            </SideSectionMid>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}

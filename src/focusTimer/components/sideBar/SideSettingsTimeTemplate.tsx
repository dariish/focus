import React, { useState, useReducer, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { IoIosArrowForward } from "react-icons/io";
import TimeBar from "../ui/TimeBar";
import { MdDeleteForever } from "react-icons/md";
import { useTimerStore } from "../../store/useTimerStore";
import { FaPlus, FaCheckCircle } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";
import Input from "../../../shared/inputs/Input";
import NumberInput from "../../../shared/inputs/NumberInput";
import { toast } from "react-toastify";
import SideSectionHeader from "../ui/SideSectionHeader";
import SideSectionMid from "../ui/SideSectionMid";
import ButtonConfirm from "../ui/ButtonConfirm";
import ButtonDelete from "../ui/ButtonDelete";
import { useChangePage, PATHS } from "../../config/routes";

function generateTitle() {
  return Math.random().toString(16).substring(2, 6).toUpperCase();
}

function formReducer(
  state: {
    title: string;
    focusTime: number;
    smallBreakTime: number;
    bigBreakTime: number;
    sequence: number;
  },
  action: {
    type: "SET_FIELD" | "RESET";
    field?: string;
    value?: string | number;
  }
) {
  switch (action.type) {
    case "SET_FIELD":
      if (action.field) {
        return { ...state, [action.field]: action.value };
      }
      return state;
    case "RESET":
      return {
        title: "",
        focusTime: 25,
        smallBreakTime: 5,
        bigBreakTime: 10,
        sequence: 4,
      };
    default:
      return state;
  }
}

function TemplateAddItem({ scrollToBottom }: { scrollToBottom: () => void }) {
  const [form, dispatch] = useReducer(formReducer, {
    title: "",
    focusTime: 25,
    smallBreakTime: 5,
    bigBreakTime: 10,
    sequence: 0,
  });
  const [templateTitle, setTemplateTitle] = useState<string>(
    `Template #${generateTitle()}`
  );

  const addTemplate = useTimerStore((s) => s.addTemplate);
  const notify = (title: string) =>
    toast.success(`${title} added Successfully!`, {
      icon: <FaCheckCircle className="fill-contrast-500 w-full h-full" />,
      progressClassName: "!bg-contrast-500",
      className: "focus-contrast-bg focus-toast-bg rounded-sm! shadow-xl",
    });

  const handleChange = ({
    name,
    value,
    type,
  }: {
    name: string;
    value: string | number;
    type: string;
  }) => {
    dispatch({
      type: "SET_FIELD",
      field: name,
      value: type === "number" ? Number(value) : value,
    });
  };

  const handleAddTemplate = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const title = form.title.trim() === "" ? templateTitle : form.title;
    addTemplate({
      title,
      focusTime: form.focusTime,
      smallBreakTime: form.smallBreakTime,
      bigBreakTime: form.bigBreakTime,
      sequence: form.sequence,
    });
    notify(title);
    dispatch({ type: "RESET" });
    setTemplateTitle(`Template #${generateTitle()}`);
    scrollToBottom();
  };

  return (
    <SideSectionHeader
      title={
        <>
          <FaPlus className="fill-contrast-500 w-3 h-3" />
          <span className="text-contrast-500 text-sm ml-2">
            Add New Template
          </span>
        </>
      }
      iconClassName="fill-contrast-500!"
      containerClassName="mt-3"
    >
      <SideSectionMid containerClassName="gap-5">
        <Input
          containerClassName="flex-row gap-2 items-center justify-between w-full"
          className="max-w-[220px]"
          label="Template Name"
          labelClassName="text-tertiary-500 font-light! text-base! text-nowrap"
          placeholder={templateTitle}
          id="title"
          name="title"
          type="text"
          value={form.title}
          maxLength={15}
          onChange={(e) =>
            handleChange({
              name: "title",
              value: e.target.value,
              type: "text",
            })
          }
        />
        <div className="w-full h-px bg-stroke-500/40"></div>
        <NumberInput
          inputContainerClassName="min-w-30!"
          containerClassName="flex-row gap-2 items-center justify-between w-full"
          value={form.focusTime}
          min={10}
          onChange={(val: number) =>
            handleChange({
              name: "focusTime",
              value: val,
              type: "number",
            })
          }
          label="Focus Time"
          placeholder="25"
          id="focusTime"
          name="focusTime"
          suffix="min"
        />
        <NumberInput
          inputContainerClassName="min-w-30!"
          containerClassName="flex-row gap-2 items-center justify-between w-full"
          value={form.smallBreakTime}
          min={2}
          max={459}
          onChange={(val: number) =>
            handleChange({
              name: "smallBreakTime",
              value: val,
              type: "number",
            })
          }
          label="Small Break Time"
          id="smallBreakTime"
          name="smallBreakTime"
          suffix="min"
        />
      </SideSectionMid>
      <SideSectionMid containerClassName="gap-5">
        <span className="text-tertiary-400 text-sm font-light py-3 px-1 rounded-sm bg-contrast-500/8 text-center">
          <LuInfo className="inline mb-0.5 mr-2 stroke-contrast-500 " />
          Choose if you want a long break after several focus sessions. <br />
          <span className="italic">If zero, no big break will be taken</span>
        </span>
        <NumberInput
          inputContainerClassName="min-w-26!"
          containerClassName="flex-row gap-2 items-center justify-between w-full"
          value={form.sequence}
          min={0}
          max={99}
          onChange={(val: number) =>
            handleChange({
              name: "sequence",
              value: val,
              type: "number",
            })
          }
          label="Cycles"
          id="bigBreakTime"
          name="sequence"
        />
        <div
          className={`duration-200 transition-opacity ${
            form.sequence <= 0 ? "opacity-50" : "opacity-100"
          }`}
        >
          <NumberInput
            inputContainerClassName="min-w-30!"
            containerClassName="flex-row gap-2 items-center justify-between w-full"
            value={form.bigBreakTime}
            min={2}
            max={459}
            onChange={(val: number) =>
              handleChange({
                name: "bigBreakTime",
                value: val,
                type: "number",
              })
            }
            label="Big Break Time"
            id="bigBreakTime"
            name="bigBreakTime"
            suffix="min"
            disabled={form.sequence <= 0}
          />
        </div>
      </SideSectionMid>
      <SideSectionMid
        containerClassName="flex justify-end flex-row"
        bottomBorder={true}
      >
        <ButtonConfirm
          onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
            handleAddTemplate(e)
          }
        >
          <FaPlus
            size={11}
            className="fill-tertiary-500 group-hover:scale-110 duration-200"
          />
          Save New Template
        </ButtonConfirm>
      </SideSectionMid>
    </SideSectionHeader>
  );
}

function TemplateItem({
  id,
  active = false,
  showDelete = true,
  title,
  focusTime,
  smallBreakTime,
  bigBreakTime,
  sequence,
  onClick,
  last = false,
  isNew = false,
}: {
  id: number;
  active?: boolean;
  showDelete?: boolean;
  title: string;
  focusTime: number;
  smallBreakTime: number;
  bigBreakTime: number;
  sequence: number;
  onClick?: () => void;
  last?: boolean;
  isNew?: boolean;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const deleteTemplate = useTimerStore((s) => s.deleteTemplate);

  function handleDeleteTemplate(e: React.SyntheticEvent) {
    e.stopPropagation();
    deleteTemplate(id);
    setShowDeleteModal(false);
    notify();
  }
  const notify = () =>
    toast.success("Template Deleted Successfully!", {
      icon: <MdDeleteForever className="fill-red-400 w-full h-full" />,
      progressClassName: "!bg-red-500/60",
      className: "focus-alert-bg focus-toast-bg rounded-sm! shadow-xl",
    });

  return (
    <motion.li
      initial={{ opacity: 0, filter: "blur(4px)", y: -20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      exit={{
        opacity: 0,
        height: 0,
        paddingBottom: 0,
        paddingTop: 0,
        scale: 0.9,
        transition: { duration: 0.3, ease: "easeInOut" },
      }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      id={`template-item-${id}`}
      className={`flex cursor-pointer bg-main-600 border-x border-stroke-500 group  duration-200 py-2 px-6 items-center gap-4 min-w-full relative overflow-hidden ${
        last ? "border-b border-stroke-500 rounded-b" : ""
      } ${active ? "bg-main-700" : "hover:bg-main-650"}`}
    >
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ x: 500 }}
            animate={{ x: 0 }}
            exit={{ x: 500 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-1 z-10 p-2 bg-main-300 flex items-center justify-between gap-4 2xl:text-base sm:text-base text-sm xl:text-sm ${
              last ? "rounded-b" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-sm bg-red-500/10 flex items-center justify-center aspect-square p-2">
              <MdDeleteForever className="fill-red-400 w-full h-full " />
            </div>
            <div className="grow flex xl:flex-row lg:flex-col xs:flex-row flex-col   gap-y-2 xl:items-center lg:items-start xs:items-center items-start">
              <p className="text-tertiary-500 font-light leading-4 text-nowrap ">
                Are you sure you want to delete?
              </p>
              <div className="flex items-center gap-2 xl:ml-auto lg:ml-0 xs:ml-auto ml-0">
                <ButtonDelete
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    handleDeleteTemplate(e)
                  }
                >
                  Delete
                </ButtonDelete>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(false);
                  }}
                  className="px-2.5 py-1 rounded-xs text-tertiary-500 bg-main-650/70   duration-300 cursor-pointer"
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-w-6 min-h-6 aspect-square border border-stroke-500 rounded-full relative ">
        <span
          className={`${
            active ? "bg-contrast-500" : "group-hover:bg-contrast-500/5"
          } inset-1 absolute  rounded-full duration-200`}
        ></span>
      </div>
      <div className="grow">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {title}
            {isNew ? (
              <motion.span
                animate={{ x: [0, 3, -2, 3, -2, 0] }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className=" text-xs text-main-300 font-bold bg-tertiary-500 px-0.5"
              >
                New
              </motion.span>
            ) : (
              ""
            )}
          </span>
          {showDelete ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              className="cursor-pointer duration-200 p-1 hover:bg-stroke-500 rounded-sm group"
            >
              <MdDeleteForever className="fill-tertiary-400 group-hover:fill-tertiary-500 transition-colors duration-200" />
            </span>
          ) : (
            <span className="text-tertiary-400 text-xs font-light leading-[0.6rem]">
              default
            </span>
          )}
        </div>
        <p className="gap-2 text-tertiary-400 text-[10px] xs:text-xs font-light leading-[0.6rem]">
          <span>
            {focusTime / 60}
            <span className="text-xs">min</span> work
          </span>
          <span className=" mx-1">&#x2192;</span>
          <span>
            {smallBreakTime / 60}
            <span className="text-xs">min</span> break
          </span>
          {sequence > 0 && (
            <>
              <span className="mx-1">&#x2192;</span>

              <span>
                after {sequence} cycles, take a {bigBreakTime / 60}
                <span className="text-xs">min</span> big break.
              </span>
            </>
          )}
        </p>
        <div
          className={`block w-full  mt-2 ${
            active ? "opacity-100" : "opacity-50 group-hover:opacity-80"
          }`}
        >
          <TimeBar
            totalTime={0}
            focusTime={focusTime}
            smallIntervalTime={smallBreakTime}
            bigIntervalTime={bigBreakTime}
            sequence={sequence}
          />
        </div>
      </div>
    </motion.li>
  );
}

export default function SideSettingsTimeTemplate() {
  const changePage = useChangePage();

  const templates = useTimerStore((s) => s.templates);
  const newTemplatesAddedRef = useRef<number>(templates.length);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeTemplate = useTimerStore((s) => s.activeTemplate);
  const changeActiveTemplate = useTimerStore((s) => s.changeActiveTemplate);
  const lastIndex = templates.length - 1;

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const activeTemplateName = templates.find(
    (template) => template.id === activeTemplate
  )?.title;

  return (
    <section id="time-template-section">
      <BreadCrumb
        className="py-1 border-y border-stroke-500/40 mb-10"
        activeItemClassName="text-tertiary-500"
        itemClassName="text-tertiary-400 hover:text-tertiary-500 duration-250"
        items={[
          {
            title: "Settings",
            onClick: () => changePage(PATHS.SIDEPAGE.SETTINGS.MENU),
          },
          { title: "Time Templates" },
        ]}
        showBackButton={true}
        backButtonClassName="border border-stroke-500/60 bg-main-600 hover:bg-main-650 duration-250 h-full p-1.5"
        onBack={() => changePage(PATHS.SIDEPAGE.SETTINGS.MENU)}
        separator={<IoIosArrowForward className="fill-stroke-600 w-3 " />}
      />
      <SideSectionHeader
        title="Choose Template"
        content={activeTemplateName}
        as="ul"
        showContainerProp={true}
      >
        {templates.map((template, index) => (
          <TemplateItem
            key={template.id}
            onClick={() => changeActiveTemplate(template.id)}
            active={activeTemplate === template.id}
            {...template}
            showDelete={template.canBeDeleted}
            last={index === lastIndex}
            isNew={index > newTemplatesAddedRef.current - 1}
          />
        ))}
      </SideSectionHeader>

      <TemplateAddItem scrollToBottom={scrollToBottom} />
    </section>
  );
}

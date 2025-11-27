import React, { useState, useReducer } from "react";
import { motion, AnimatePresence } from "motion/react";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import type { SideSettingsPage } from "./SideSettings";
import { IoIosArrowForward } from "react-icons/io";
import TimeBar from "../ui/TimeBar";
import { MdDeleteForever } from "react-icons/md";
import { useTimerStore } from "../../store/useTimerStore";
import { FaPlus } from "react-icons/fa";
import { LuInfo } from "react-icons/lu";

import SideSection from "./SideSection";
import Input from "../../../shared/inputs/Input";
import NumberInput from "../../../shared/inputs/NumberInput";

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
}) {
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const deleteTemplate = useTimerStore((s) => s.deleteTemplate);

  return (
    <li
      onClick={onClick}
      className="flex cursor-pointer group hover:bg-contrast-500/15 rounded duration-200 py-2 px-2 items-center gap-4 min-w-full relative overflow-hidden"
    >
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0.5, x: 500 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.5, x: 500 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10 p-2  rounded-sm bg-main-500 flex flex-col items-center justify-center gap-3"
          >
            <p className="text-tertiary-500 font-light leading-4 text-center">
              Are you sure you want to delete this template?
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTemplate(id);
                }}
                className=" px-4 rounded-sm text-white border border-stroke-500  bg-red-800 transition-all duration-300 ease-out cursor-pointer active:border-tertiary-500 hover:border-red-200"
              >
                Delete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(false);
                }}
                className="px-4 rounded-sm text-tertiary-500 border border-stroke-500  bg-tertiary-500/10  transition-all duration-300 ease-out cursor-pointer active:border-tertiary-500 hover:border-blue-500 "
              >
                Don't delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-w-6 min-h-6 aspect-square border border-stroke-500 rounded-full relative ">
        <span
          className={`${
            active ? "bg-contrast-500" : "group-hover:bg-contrast-500/20"
          } inset-1 absolute  rounded-full duration-200`}
        ></span>
      </div>
      <div className="grow">
        <div className="flex items-center justify-between gap-2">
          <span>{title}</span>
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
        <div className="block w-full  mt-2">
          <TimeBar
            totalTime={10800}
            focusTime={focusTime}
            smallIntervalTime={smallBreakTime}
            bigIntervalTime={bigBreakTime}
            sequence={sequence}
          />
        </div>
      </div>
    </li>
  );
}

export default function SideSettingsTimeTemplate({
  changePage,
}: {
  changePage: (page: SideSettingsPage) => void;
}) {
  console.log("RERUNS FOR SURE");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const templates = useTimerStore((s) => s.templates);
  const activeTemplate = useTimerStore((s) => s.activeTemplate);
  console.log("activeTemplate", activeTemplate);
  const changeActiveTemplate = useTimerStore((s) => s.changeActiveTemplate);
  const lastIndex = templates.length - 1;
  const addTemplate = useTimerStore((s) => s.addTemplate);

  const [form, dispatch] = useReducer(
    (
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
    ) => {
      switch (action.type) {
        case "SET_FIELD":
          console.log("SET_FIELD", action.field, action.value);
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
    },
    {
      title: "",
      focusTime: 25,
      smallBreakTime: 5,
      bigBreakTime: 10,
      sequence: 4,
    }
  );

  const handleAddTemplate = (e: React.SyntheticEvent) => {
    e.preventDefault();
    addTemplate({
      title: form.title,
      focusTime: form.focusTime,
      smallBreakTime: form.smallBreakTime,
      bigBreakTime: form.bigBreakTime,
      sequence: form.sequence,
    });
  };

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

  return (
    <section>
      <BreadCrumb
        activeItemClassName="text-tertiary-500"
        itemClassName="text-tertiary-400 hover:text-tertiary-500 duration-250"
        items={[
          { title: "Settings", onClick: () => changePage("Menu") },
          { title: "Time Templates" },
        ]}
        separator={<IoIosArrowForward className="fill-stroke-700 w-3 " />}
      />
      <SideSection>
        <span>Templates</span>
        <ul className="py-4 flex flex-col gap-2">
          {templates.map((template, index) => (
            <React.Fragment key={template.id}>
              <TemplateItem
                onClick={() => changeActiveTemplate(template.id)}
                active={activeTemplate === template.id}
                {...template}
                showDelete={template.canBeDeleted}
              />
              {index !== lastIndex && (
                <span className="w-full h-px bg-stroke-500/50"></span>
              )}
            </React.Fragment>
          ))}
        </ul>
      </SideSection>
      <SideSection>
        <div
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <FaPlus className="fill-contrast-500 " />
          <span className="text-contrast-500 ">Add New Template</span>
          <IoIosArrowForward
            className={`ml-auto group-hover:scale-130 duration-250 fill-contrast-500   ${
              showAddForm ? "rotate-270" : "rotate-90"
            }`}
          />
        </div>
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "479px", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden pt-6 flex flex-col gap-5"
            >
              <Input
                containerClassName="flex-row gap-2 items-center justify-between w-full"
                className="max-w-[220px]"
                label="Template Name"
                labelClassName="text-tertiary-500 font-light! text-base! text-nowrap"
                placeholder={`Template ${templates.length + 1}`}
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={(e) =>
                  handleChange({
                    name: "title",
                    value: e.target.value,
                    type: "text",
                  })
                }
              />
              <NumberInput
                inputContainerClassName="min-w-34!"
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
                inputContainerClassName="min-w-34!"
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
              <span className="w-full h-px bg-stroke-500/50"></span>
              <span className="text-tertiary-400 text-sm font-light leading-[0.9rem] py-3 px-1 rounded-sm bg-stroke-500/10 text-center">
                <LuInfo className="inline mb-0.5 mr-2 stroke-contrast-500" />
                Decide if you want to take a big break after a certain number of
                Focus times. (if zero, no big break will be taken)
              </span>
              <NumberInput
                inputContainerClassName="min-w-34!"
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
              <NumberInput
                inputContainerClassName="min-w-34!"
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
              />
              <button
                onClick={(e) => handleAddTemplate(e)}
                className="py-2 px-6 mt-auto rounded-sm text-tertiary-500  text-base border border-stroke-500  bg-tertiary-500/10  transition-all duration-300 ease-out cursor-pointer active:border-tertiary-500 hover:border-secondary-500   group relative overflow-hidden flex items-center justify-center gap-4"
              >
                <FaPlus className="fill-tertiary-500 group-hover:scale-110 duration-200" />
                Save New Template
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </SideSection>
    </section>
  );
}

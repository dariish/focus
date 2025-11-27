import { motion } from "motion/react";
import type { SidePage } from "./TimeSideBar";
import { RiSettings4Fill } from "react-icons/ri";
import { PiListDashesFill } from "react-icons/pi";
import { MdGraphicEq } from "react-icons/md";
import { useUIStore } from "../../store/useUIStore";

export default function HeaderSidebar({
  onChange,
  firstLabel,
  secondLabel,
  activeLabel,
  isOpen,
}: {
  onChange: (val: SidePage) => void;
  firstLabel: SidePage;
  secondLabel: SidePage;
  activeLabel: SidePage;
  isOpen: boolean;
}) {
  const toggleSideBar = useUIStore((s) => s.toggleSideBar);
  // Calculate overlay position based on active label
  const getOverlayStyle = () => {
    if (activeLabel === firstLabel) {
      return { left: "0.25rem", right: "50%", width: "calc(50% - 0.5rem)" };
    } else if (activeLabel === secondLabel) {
      return { left: "50%", right: "0.25rem", width: "calc(50% - 0.3rem)" };
    } else {
      return { left: "100%", right: "2rem", width: "calc(50% - 0.5rem)" };
    }
  };

  const getOverlayStyleSettings = () => {
    if (activeLabel === "Settings" && isOpen) {
      return { left: "0.25rem", right: "0.25rem" };
    } else {
      return { left: "-100%", right: "40rem" };
    }
  };

  function openSidePageFromMiniSidebar(page: SidePage) {
    toggleSideBar();
    onChange(page);
  }

  const isFirstActive = activeLabel === firstLabel;
  const isSecondActive = activeLabel === secondLabel;

  return (
    <div
      className={`flex justify-between ${
        isOpen ? "flex-row" : "flex-col gap-4"
      }`}
    >
      {isOpen ? (
        <div className="relative gap-1 rounded-full inline-flex items-center justify-between bg-main-700 border-2 border-main-900 overflow-hidden">
          <motion.div
            layout
            initial={false}
            animate={getOverlayStyle()}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="absolute top-1 bottom-1 rounded-full bg-secondary-500"
          />
          <span
            onClick={() => onChange(firstLabel)}
            className={`z-2 w-1/2 xl:px-10 lg:px-7 sm:px-10 px-8  py-2 rounded-full text-center text-nowrap duration-250 sm:text-lg xl:text-lg lg:text-base ${
              !isFirstActive
                ? "cursor-pointer hover:text-secondary-900 "
                : "cursor-default"
            }`}
          >
            {firstLabel}
          </span>
          <span
            onClick={() => onChange(secondLabel)}
            className={`z-2 w-1/2 xl:px-10 lg:px-7 sm:px-10 px-8 py-2 rounded-full text-center text-nowrap duration-250 sm:text-lg xl:text-lg lg:text-base ${
              !isSecondActive
                ? "cursor-pointer hover:text-secondary-900"
                : "cursor-default"
            }`}
          >
            {secondLabel}
          </span>
        </div>
      ) : (
        <>
          <button
            className="group duration-300 bg-main-700 border-2 border-main-900 rounded-full p-3 relative overflow-hidden cursor-pointer"
            onClick={() => openSidePageFromMiniSidebar("Tasks")}
          >
            <PiListDashesFill className="relative z-10 w-5 h-5 duration-300 group-hover:fill-secondary-900" />
          </button>
          <button
            className="group duration-300 bg-main-700 border-2 border-main-900 rounded-full p-3 relative overflow-hidden cursor-pointer"
            onClick={() => openSidePageFromMiniSidebar("Stats")}
          >
            <MdGraphicEq className="relative z-10 w-5 h-5 duration-300 group-hover:fill-secondary-900" />
          </button>
        </>
      )}
      <button
        onClick={
          isOpen
            ? () => onChange("Settings")
            : () => openSidePageFromMiniSidebar("Settings")
        }
        className={`group  duration-300 bg-main-700 border-2 border-main-900 rounded-full p-3 relative overflow-hidden ${
          activeLabel === "Settings" && isOpen
            ? "cursor-default"
            : " cursor-pointer"
        }`}
      >
        <motion.div
          layout
          initial={false}
          animate={getOverlayStyleSettings()}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="absolute top-1 bottom-1 rounded-full bg-secondary-500"
        />
        <RiSettings4Fill
          className={`relative z-10 xl:w-5 xl:h-5 lg:w-4 lg:h-4 w-5 h-5 duration-300 ${
            activeLabel === "Settings" && isOpen
              ? ""
              : " group-hover:fill-secondary-900"
          }`}
        />
      </button>
    </div>
  );
}

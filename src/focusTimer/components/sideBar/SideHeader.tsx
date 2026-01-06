import { motion } from "motion/react";
import { RiSettings4Fill } from "react-icons/ri";
import { PiListDashesFill } from "react-icons/pi";
import { MdGraphicEq } from "react-icons/md";
import { PATHS } from "../../config/routes";

export default function SideHeader({
  onChange,
  firstLabel,
  secondLabel,
  activeLabel,
  isOpen,
}: {
  onChange: (val: string) => void;
  firstLabel: string;
  secondLabel: string;
  activeLabel: string | null;
  isOpen: boolean;
}) {
  // Calculate overlay position based on active label
  const getOverlayStyle = () => {
    if (activeLabel === firstLabel) {
      return { left: "0.1rem", right: "50%", width: "50%" };
    } else if (activeLabel === secondLabel) {
      return { left: "52%", right: "0.1rem", width: "47%" };
    } else {
      return { left: "120%", right: "0rem" };
    }
  };

  const getOverlayStyleSettings = () => {
    if (activeLabel === PATHS.SIDEPAGE.SETTINGS.ROOT && isOpen) {
      return { left: "0.1rem", right: "0.1rem" };
    } else {
      return { left: "-100%", right: "40rem" };
    }
  };

  function openSidePageFromMiniSidebar(page: string) {
    // Just navigate to the URL - TimeSideBar will detect it and open the sidebar
    onChange(page);
  }

  const isFirstActive = activeLabel === firstLabel;
  const isSecondActive = activeLabel === secondLabel;
  const classNameLabels =
    "z-2 w-1/2 xl:px-8 px-8 py-0.5 m-0.5 rounded-xs  text-center text-nowrap duration-250 text-lg";
  const classNameButtonHeader =
    "w-full max-h-[70px] group aspect-square flex items-center justify-center duration-300 bg-main-650 border-2 hover:bg-main-750 border-stroke-500 rounded p-2 cursor-pointer";

  return (
    <div
      className={`flex justify-between items-center ${
        isOpen ? "flex-row" : "flex-col gap-4"
      }`}
    >
      {isOpen ? (
        <div className="relative gap-1 rounded inline-flex items-center justify-between bg-main-650 border-2 border-stroke-500 overflow-hidden">
          <motion.div
            layout
            initial={false}
            animate={getOverlayStyle()}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="absolute top-0.5 bottom-0.5 rounded-xs  bg-tertiary-500 border-2 border-main-800 outline outline-stroke-600 "
          />
          <span
            onClick={() => onChange(firstLabel)}
            className={`${classNameLabels} ${
              !isFirstActive
                ? "cursor-pointer hover:bg-main-750"
                : "cursor-default text-main-300"
            }`}
          >
            {firstLabel}
          </span>
          <span
            onClick={() => onChange(secondLabel)}
            className={`${classNameLabels} ${
              !isSecondActive
                ? "cursor-pointer hover:bg-main-750"
                : "cursor-default text-main-300"
            }`}
          >
            {secondLabel}
          </span>
        </div>
      ) : (
        <>
          <button
            className={classNameButtonHeader}
            onClick={() =>
              openSidePageFromMiniSidebar(PATHS.SIDEPAGE.TASKS.ROOT)
            }
          >
            <PiListDashesFill className="w-full h-full duration-300 " />
          </button>
          <button
            className={classNameButtonHeader}
            onClick={() =>
              openSidePageFromMiniSidebar(PATHS.SIDEPAGE.STATS.ROOT)
            }
          >
            <MdGraphicEq className="w-full h-full duration-300 " />
          </button>
        </>
      )}
      <button
        onClick={
          isOpen
            ? () => onChange(PATHS.SIDEPAGE.SETTINGS.ROOT)
            : () => openSidePageFromMiniSidebar(PATHS.SIDEPAGE.SETTINGS.ROOT)
        }
        className={`group aspect-square flex items-center justify-center duration-300 bg-main-650 border-2 hover:bg-main-750 border-stroke-500 rounded p-2 relative overflow-hidden ${
          activeLabel === PATHS.SIDEPAGE.SETTINGS.ROOT && isOpen
            ? "cursor-default"
            : " cursor-pointer"
        }
        ${isOpen ? "" : "w-full max-h-[70px]"}
        `}
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
          className="absolute top-0.5 bottom-0.5 rounded-xs bg-tertiary-500 border-2 border-main-800 outline outline-stroke-600"
        />
        <RiSettings4Fill
          className={`relative z-10 duration-300 ${
            isOpen ? "w-5 h-5 " : "w-full h-full"
          }
            ${
              activeLabel === PATHS.SIDEPAGE.SETTINGS.ROOT && isOpen
                ? "fill-main-500"
                : " "
            }`}
        />
      </button>
    </div>
  );
}

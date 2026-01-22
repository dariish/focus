import { IoIosArrowForward } from "react-icons/io";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { PATHS, useChangePage } from "../../config/routes";
import SideSectionHeader from "../ui/SideSectionHeader";
import SideSectionMid from "../ui/SideSectionMid";
import ToggleInput from "../../../shared/inputs/ToggleInput";
import SelectInput from "../../../shared/inputs/SelectInput";
import {
  useUIStore,
  type PlayerDesign,
  type TimerFormat,
  type TimerObject,
} from "../../store/useUIStore";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import { AnimatePresence, motion } from "motion/react";

function TimerObjectItem({
  active,
  value,
  img,
  onClick,
}: {
  active: boolean;
  value: TimerObject;
  img: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`aspect-square flex items-center justify-center border relative bg-main-650 border-stroke-500 duration-250 cursor-pointer rounded-sm xl:p-7 lg:p-4 md:p-10 sm:p-6 p-3 ${
        active
          ? "bg-main-750 border-secondary-500!"
          : "hover:border-secondary-500/50!"
      }`}
    >
      {active && (
        <div className="absolute top-0 right-0 w-6 h-6 bg-secondary-500 rounded-xs flex items-center justify-center">
          <FaCheck fill="white" className="w-3 h-3" />
        </div>
      )}
      {img ? (
        <img src={img} alt={value} className="w-full h-full object-contain" />
      ) : (
        <MdOutlineImageNotSupported className="fill-tertiary-400 w-full h-full" />
      )}
    </div>
  );
}

function PlayerDesignItem({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center border relative bg-main-650 border-stroke-500 duration-250 cursor-pointer rounded-sm py-3 px-5 ${
        active
          ? "bg-main-750 border-secondary-500!"
          : "hover:border-secondary-500/50!"
      }`}
    >
      {active && (
        <div className="absolute -top-2 -right-2 rounded-full w-6 h-6 bg-secondary-500 flex items-center justify-center">
          <FaCheck fill="white" className="w-3 h-3" />
        </div>
      )}
      {label}
    </div>
  );
}
export default function SideTimeUI() {
  const changePage = useChangePage();
  const showTimer = useUIStore((s) => s.showTimer);
  const toggleTimer = useUIStore((s) => s.toggleTimer);

  const activeTimerFormat = useUIStore((s) => s.activeTimerFormat);
  const setTimerFormat = useUIStore((s) => s.setTimerFormat);
  const activeTimerObject = useUIStore((s) => s.activeTimerObject);
  const setTimerObject = useUIStore((s) => s.setTimerObject);
  const activePlayerDesign = useUIStore((s) => s.activePlayerDesign);
  const setPlayerDesign = useUIStore((s) => s.setPlayerDesign);
  const showSequenceSkips = useUIStore((s) => s.showSequenceSkips);
  const toggleSequenceSkips = useUIStore((s) => s.toggleSequenceSkips);
  const showAllSequences = useUIStore((s) => s.showAllSequences);
  const toggleAllSequences = useUIStore((s) => s.toggleAllSequences);

  const timerFormats: Array<{ label: string; value: TimerFormat }> = [
    { label: "Full Time", value: "h:m:s" },
    { label: "Minutes & Seconds", value: "m:s" },
    { label: "Hours & Minutes", value: "h:m" },
    { label: "Minutes Only", value: "m" },
  ];
  const timerObjects: Array<{ value: TimerObject; img: string }> = [
    { value: "", img: "" },
    { value: "plant", img: "/plant.png" },
    { value: "character", img: "/character.png" },
    { value: "beer", img: "/beer.png" },
  ];

  const playerDesigns: Array<{ value: PlayerDesign }> = [
    { value: "Default" },
    { value: "Minimalistic" },
  ];
  return (
    <section>
      <BreadCrumb
        className="py-1 border-y border-stroke-500/40 mb-10"
        activeItemClassName="text-tertiary-500"
        itemClassName="text-tertiary-400 hover:text-tertiary-500 duration-250"
        items={[
          {
            title: "Settings",
            onClick: () => changePage(PATHS.SIDEPAGE.SETTINGS.MENU),
          },
          { title: "Time Player Design" },
        ]}
        showBackButton={true}
        backButtonClassName="border border-stroke-500/60 bg-main-600 hover:bg-main-650 duration-250 h-full p-1.5"
        onBack={() => changePage(PATHS.SIDEPAGE.SETTINGS.MENU)}
        separator={<IoIosArrowForward className="fill-stroke-600 w-3 " />}
      />
      <div className="flex flex-col gap-4">
        <SideSectionHeader
          title="Timer"
          content={<span>{showTimer ? "Show Timer" : "Hide Timer"}</span>}
          showContainerProp={true}
        >
          <SideSectionMid containerClassName="gap-4">
            <ToggleInput
              label="Show Time left"
              checked={showTimer}
              onChange={() => toggleTimer()}
            />
          </SideSectionMid>
          <SideSectionMid containerClassName="gap-4" bottomBorder={true}>
            <AnimatePresence mode="wait">
              {showTimer ? (
                <motion.div
                  key="timer-format"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <SelectInput
                    disabled={!showTimer}
                    label="Timer format"
                    options={timerFormats}
                    value={activeTimerFormat}
                    onChange={(value) => setTimerFormat(value as TimerFormat)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="timer-object"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <p className="text-tertiary-400 text-sm mb-4 font-light">
                    Object
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {timerObjects.map((item) => (
                      <TimerObjectItem
                        key={item.value}
                        active={activeTimerObject === item.value}
                        value={item.value}
                        img={item.img}
                        onClick={() => setTimerObject(item.value)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </SideSectionMid>
        </SideSectionHeader>
        <SideSectionHeader
          title="Player Design"
          content={<span>{activePlayerDesign}</span>}
          showContainerProp={true}
        >
          <SideSectionMid
            containerClassName="flex flex-row gap-2"
            bottomBorder={true}
          >
            {playerDesigns.map((item) => (
              <PlayerDesignItem
                key={item.value}
                active={activePlayerDesign === item.value}
                label={item.value}
                onClick={() => setPlayerDesign(item.value as PlayerDesign)}
              />
            ))}
          </SideSectionMid>
        </SideSectionHeader>
        <SideSectionHeader
          title="Time Options"
          content={""}
          showContainerProp={true}
        >
          <SideSectionMid containerClassName="gap-4" bottomBorder={true}>
            <ToggleInput
              label="Show Sequence Skips on Breaks"
              checked={showSequenceSkips}
              onChange={() => toggleSequenceSkips()}
            />
            <ToggleInput
              label="Show All Break Sequences"
              checked={showAllSequences}
              onChange={() => toggleAllSequences()}
            />
          </SideSectionMid>
        </SideSectionHeader>
      </div>
    </section>
  );
}

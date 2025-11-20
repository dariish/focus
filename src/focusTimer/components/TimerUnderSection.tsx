import ThreeToggleButtons from "./ThreeToggleButtons";
import { MdViewTimeline } from "react-icons/md";
import TimeBar from "./TimeBar";
import { useState } from "react";
import { useTimerStore } from "../store/useTimerStore";

export default function TimerUnderSection() {
  const [isHover, setHover] = useState(false);
  const mode = useTimerStore((s) => s.mode);

  function changeHover(bool: boolean) {
    if (mode === "break") setHover(bool);
  }

  return (
    <div className="flex flex-col xs:gap-2 sm:pt-8 pt-12  w-full ">
      <div className="flex xs:flex-row flex-col-reverse xs:gap-0 gap-10 justify-between items-center">
        <button
          onMouseEnter={() => changeHover(true)}
          onMouseLeave={() => changeHover(false)}
          className={`flex duration-200 items-center gap-2 sm:gap-3 text-sm xs:text-base sm:text-xl border-b-0 xs:border-b border border-stroke-500 rounded-sm px-3 sm:px-4 xs:py-[9px] py-1.5 transition-colors xs:translate-y-0 translate-y-0.5 ${
            isHover ? "bg-main-600 border-secondary-400!" : "bg-main-400"
          } ${
            mode !== "break" ? "opacity-40 cursor-default" : "cursor-pointer"
          }`}
        >
          <MdViewTimeline className="sm:w-5 sm:h-5 w-4 h-4 " /> Pomodoro
        </button>
        <ThreeToggleButtons />
      </div>
      <div
        onMouseEnter={() => changeHover(true)}
        onMouseLeave={() => changeHover(false)}
        className={` border border-stroke-500 rounded-sm px-3 pt-4 pb-3 duration-200 transition-colors ${
          isHover ? "bg-main-600 border-secondary-400!" : "bg-main-400"
        } ${mode !== "break" ? "opacity-40 cursor-default" : "cursor-pointer"}`}
      >
        <TimeBar
          onHover={isHover}
          totalTime={240}
          focusTime={25}
          smallIntervalTime={5}
          bigIntervalTime={10}
          sequence={2}
        />
      </div>
    </div>
  );
}

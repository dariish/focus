import { MdViewTimeline } from "react-icons/md";
import { useState } from "react";
import ThreeToggleButtons from "./ThreeToggleButtons";
import { useTimerStore } from "../../store/useTimerStore";
import TimeBar from "../ui/TimeBar";

export default function TimerUnderSection() {
  const [isHover, setHover] = useState(false);
  const mode = useTimerStore((s) => s.mode);
  const totalTime = useTimerStore((s) => s.currentTime);
  const activeTemplateData = useTimerStore((s) => {
    const t = s.templates.find((t) => t.id === s.activeTemplate);
    return t || s.templates[0];
  });

  function changeHover(bool: boolean) {
    if (mode === "break") setHover(bool);
  }

  return (
    <div className="flex flex-col xs:gap-2 sm:mt-24 mt-12 w-full    ">
      <div className="flex xs:flex-row flex-col-reverse xs:gap-0 gap-10 justify-between items-center">
        <button
          onMouseEnter={() => changeHover(true)}
          onMouseLeave={() => changeHover(false)}
          className={`flex duration-500 items-center gap-2 sm:gap-3 text-sm xs:text-base sm:text-xl border-b-0 xs:border-b border border-main-300 rounded-sm px-3 sm:px-4 xs:py-[9px] py-1.5 transition-all xs:translate-y-0 translate-y-0.5  ${
            isHover ? "bg-main-600 border-secondary-400!" : ""
          } ${
            mode !== "break" ? "opacity-40 cursor-default" : "cursor-pointer"
          }`}
        >
          <MdViewTimeline className="sm:w-5 sm:h-5 w-4 h-4 " />{" "}
          {activeTemplateData.title}
        </button>
        <ThreeToggleButtons />
      </div>
      <div
        onMouseEnter={() => changeHover(true)}
        onMouseLeave={() => changeHover(false)}
        className={` border border-main-300 rounded-sm px-3 pt-4 pb-3 duration-200 transition-colors ${
          isHover ? " border-secondary-400!" : ""
        } ${mode !== "break" ? "opacity-40 cursor-default" : "cursor-pointer"}`}
      >
        <TimeBar
          onHover={isHover}
          totalTime={totalTime}
          focusTime={activeTemplateData.focusTime}
          smallIntervalTime={activeTemplateData.smallBreakTime}
          bigIntervalTime={activeTemplateData.bigBreakTime}
          sequence={activeTemplateData.sequence}
        />
      </div>
    </div>
  );
}

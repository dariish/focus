import { MdViewTimeline } from "react-icons/md";
import { useEffect, useState } from "react";
import ThreeToggleButtons from "./ThreeToggleButtons";
import { useTimerStore } from "../../store/useTimerStore";
import TimeBar from "../ui/TimeBar";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "../../config/routes";

export default function TimerUnderSection() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isHover, setHover] = useState(false);
  const [isOnTheTimeTemplateSection, setIsOnTheTimeTemplateSection] =
    useState(false);
  const breaking = useTimerStore((s) => s.break);
  const totalTime = useTimerStore((s) => s.currentTime);
  const activeTemplateData = useTimerStore((s) => {
    const t = s.templates.find((t) => t.id === s.activeTemplate);
    return t || s.templates[0];
  });

  useEffect(() => {
    if (location.pathname.includes(PATHS.SIDEPAGE.SETTINGS.TIME_TEMPLATE)) {
      console.log("scrolling to time template sectionOLA");
      const timeoutId = setTimeout(() => {
        document
          .getElementById("time-template-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      setIsOnTheTimeTemplateSection(true);
      return () => clearTimeout(timeoutId);
    } else {
      setIsOnTheTimeTemplateSection(false);
    }
  }, [location.pathname]);

  function changeHover(bool: boolean) {
    if (breaking) setHover(bool);
  }

  function handleClickOpenTemplates() {
    navigate(
      `/${PATHS.SIDEPAGE.SETTINGS.ROOT}/${PATHS.SIDEPAGE.SETTINGS.TIME_TEMPLATE}`
    );
    document
      .getElementById("time-template-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="flex flex-col xs:gap-2 sm:mt-24 mt-12 w-full    ">
      <div className="flex xs:flex-row flex-col-reverse xs:gap-2 gap-4 justify-between items-center">
        <button
          onClick={handleClickOpenTemplates}
          onMouseEnter={() => changeHover(true)}
          onMouseLeave={() => changeHover(false)}
          className={`duration-500 group sm:text-xl border-b-0 xs:border-b border border-stroke-500 rounded-xs sm:p-0.5 transition-all xs:translate-y-0 translate-y-0.5 truncate bg-main-300 xs:w-auto w-full  ${
            !breaking ? "opacity-40 cursor-default " : "cursor-pointer "
          } ${
            breaking && isOnTheTimeTemplateSection
              ? "cursor-default!  border-contrast-500/40!"
              : ""
          }`}
        >
          <div
            className={`flex items-center justify-center xs:w-auto w-full rounded-xs gap-2 sm:gap-3 px-3 sm:px-2 xs:py-1 pt-2 text-base sm:text-xl ${
              isHover ? "bg-main-600 " : ""
            } ${
              breaking && isOnTheTimeTemplateSection
                ? "cursor-default! bg-main-650 border-contrast-500/40! text-contrast-500"
                : ""
            }`}
          >
            <MdViewTimeline
              className={`sm:min-w-5 sm:min-h-5 min-w-4 min-h-4 ${
                breaking && isOnTheTimeTemplateSection
                  ? "fill-contrast-500"
                  : "fill-tertiary-500"
              } `}
            />{" "}
            {activeTemplateData.title}
          </div>
        </button>
        <ThreeToggleButtons />
      </div>
      <div
        onClick={handleClickOpenTemplates}
        onMouseEnter={() => changeHover(true)}
        onMouseLeave={() => changeHover(false)}
        className={` xs:border border-x border-b border-stroke-500 rounded-xs px-3 pt-4 pb-3 duration-200 transition-colors  ${
          isHover ? " bg-main-600" : ""
        } ${!breaking ? "opacity-40 cursor-default" : "cursor-pointer"} ${
          breaking && isOnTheTimeTemplateSection
            ? "cursor-default! bg-main-650 border-contrast-500/40!"
            : ""
        }`}
      >
        <TimeBar
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

import { useMemo } from "react";
import TimeInput from "../../../shared/timer/TimeInput";
import { useTimerStore } from "../../store/useTimerStore";
import { FaClock, FaPlay } from "react-icons/fa";
import FocusHeader from "../FocusHeader";
import TimerUnderSection from "./TimerUnderSection";
import TaskItemIsolated from "../tasks/TaskItemIsolated";
import { useTimePlayerStore } from "../../store/useTimePlayerStore";

export default function TimerSection() {
  //controls the buttons, if its zero it will receive here.
  //Controls the time, if free mode, will change back the time to zero.
  const currentTime = useTimerStore((s) => s.currentTime);
  const changeCurrentTime = useTimerStore((s) => s.changeCurrentTime);
  const startTimer = useTimePlayerStore((s) => s.startTimer);

  const finishTime = useMemo(() => {
    if (currentTime <= 0) return null;
    const finishDate = new Date(Date.now() + currentTime * 1000);
    const hours = finishDate.getHours();
    const minutes = finishDate.getMinutes();
    const period = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    const time = `${displayHours}:${minutes.toString().padStart(2, "0")}`;
    return { time, period };
  }, [currentTime]);

  function getValue(val: number) {
    changeCurrentTime(val);
  }

  return (
    <div className="w-full flex-1 flex justify-center items-center xs:px-6 px-3 py-10">
      <div className="flex flex-col items-center justify-center w-full max-w-[600px]">
        <p
          className={`${
            finishTime ? "" : "border-none"
          } px-4 py-1 rounded-full md:border-none border border-main-600 flex items-end text-sm md:mb-4 mb-10`}
        >
          {finishTime ? (
            <>
              <span className="text-tertiary-400 text-xs mr-2 mb-px">
                finishs at
              </span>
              <span className="flex items-center gap-0.5 text-tertiary-500">
                <FaClock className="mr-px w-3 h-3 fill-tertiary-500" />
                {finishTime.time}
              </span>
              <span className="ml-0.5 text-xs mb-px">{finishTime.period}</span>
            </>
          ) : (
            <span>&nbsp;</span>
          )}
        </p>
        <TimeInput
          sendValue={getValue}
          format={{ type: "h:min", dots: true }}
          initialValue={currentTime}
          range={{ min: 0, max: 32400 }}
        />
        <TimerUnderSection />
        <button
          onClick={startTimer}
          className="mb-10 mt-8 py-3 xs:px-24 px-14 rounded border border-stroke-500 ring-4 ring-stroke-600/10 bg-tertiary-500 transition-all duration-300 ease-out cursor-pointer active:border-main-500  active:ring-tertiary-500/70 active:ring-4 hover:ring-3 hover:ring-tertiary-500/50 hover:border-main-300  group relative overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-center gap-2">
            <FaPlay className="mb-0.5 sm:w-6 sm:h-6 xs:w-5 xs:h-5 w-4 h-4 fill-main-500   transition-colors duration-300" />
            <span className=" text-main-500 font-black text-xl xs:text-2xl  transition-colors duration-300">
              START
            </span>
          </div>
        </button>
        <TaskItemIsolated />
      </div>
    </div>
  );
}

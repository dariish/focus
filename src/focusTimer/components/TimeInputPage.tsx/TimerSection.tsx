import { useMemo } from "react";
import TimeInput from "../../../shared/timer/TimeInput";
import { useTimerStore } from "../../store/useTimerStore";
import { FaPlay } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import FocusHeader from "../FocusHeader";
import TimerUnderSection from "./TimerUnderSection";

export default function TimerSection() {
  //controls the buttons, if its zero it will receive here.
  //Controls the time, if free mode, will change back the time to zero.
  const initTime = useTimerStore((s) => s.newInitTime);
  const changeInitTime = useTimerStore((s) => s.changeInitTime);

  const finishTime = useMemo(() => {
    if (initTime <= 0) return null;
    const finishDate = new Date(Date.now() + initTime * 1000);
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    const formatted = formatter.format(finishDate);
    const { hour12 } = formatter.resolvedOptions();

    if (hour12) {
      const periodMatch = formatted.match(/([AP]\.?M\.?)$/i);
      const period = periodMatch
        ? periodMatch[1].replace(/\./g, "").toUpperCase()
        : null;
      const time = periodMatch
        ? formatted.replace(periodMatch[0], "").trim()
        : formatted;
      return { time, period };
    }

    return { time: formatted, period: null };
  }, [initTime]);

  function getValue(val: number) {
    changeInitTime(val);
  }

  return (
    <section className="relative w-full min-h-[calc(100vh-50px)] flex flex-col lg:min-w-3/5 ">
      <div className="absolute top-0 left-0 right-0 h-[50px]w-full p-4">
        <FocusHeader />
      </div>
      <div className="w-full flex-1 flex justify-center items-center xs:px-6 px-3 py-10">
        <div className="flex flex-col items-center justify-center w-full max-w-xl">
          <span
            className={`${
              finishTime ? "" : "border-none"
            } px-4 py-1 rounded-full md:border-none border border-main-600 flex items-center text-sm md:mb-4 mb-10 text-tertiary-400`}
          >
            {finishTime ? (
              <>
                ends at <IoMdTime className="ml-1.5" />
                {finishTime.time}
                {finishTime.period && (
                  <span className="uppercase text-xs text-stroke-400">
                    {finishTime.period}
                  </span>
                )}
              </>
            ) : (
              <span>&nbsp;</span>
            )}
          </span>
          <TimeInput
            sendValue={getValue}
            format={{ type: "h:min", dots: true }}
            initialValue={initTime}
            range={{ min: 0, max: 32400 }}
          />
          <TimerUnderSection />
          <button className="mt-8  py-3 px-24   rounded text-main-500 font-black text-xl xs:text-2xl border border-stroke-500 ring-4 ring-stroke-600/10 bg-tertiary-500 shadow-lg shadow-tertiary-500/30!  hover:scale-102  active:scale-100 active:rotate-0 transition-all duration-300 ease-out cursor-pointer active:border-secondary-500 hover:ring-2 hover:ring-secondary-500 hover:border-stroke-500/30  group relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-main-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

            <div className="relative z-10 flex items-center justify-center xs:gap-2 gap-4">
              <FaPlay className="mb-0.5 w-6 h-6 fill-main-500  group-hover:fill-main-500/90 transition-colors duration-300" />
              <span className="xs:block hidden">START</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

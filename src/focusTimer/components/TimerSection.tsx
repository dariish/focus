import { useMemo } from "react";
import TimeInput from "../../shared/timer/TimeInput";
import { useTimerStore } from "../store/useTimerStore";
import TimerUnderSection from "./TimerUnderSection";
import { FaPlay } from "react-icons/fa";
import { IoMdTime } from "react-icons/io";
import FocusHeader from "./FocusHeader";

export default function TimerSection() {
  //controls the buttons, if its zero it will receive here.
  //Controls the time, if free mode, will change back the time to zero.
  const initTime = useTimerStore((s) => s.initTime);
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
    <section className="w-full min-h-[calc(100vh-40px)] flex flex-col lg:min-w-2/3 ">
      <div className="w-full p-4">
        <FocusHeader />
      </div>
      <div className="w-full flex-1 flex justify-center items-center xs:px-6 px-2 py-10">
        <div className="flex flex-col items-center justify-center w-full max-w-xl">
          <span className="flex items-center text-sm mb-4">
            ends at <IoMdTime className="ml-1.5" />
            {finishTime ? (
              <>
                {finishTime.time}
                {finishTime.period && (
                  <span className="uppercase text-xs text-stroke-400">
                    {finishTime.period}
                  </span>
                )}
              </>
            ) : (
              "--:--"
            )}
          </span>
          <TimeInput
            sendValue={getValue}
            format={{ type: "h:min", dots: true }}
            initialValue={initTime}
            range={{ min: 0, max: 32400 }}
          />
          <TimerUnderSection />
          <button className="mt-8 xs:p-4 p-2  w-full rounded text-main-500 font-black text-2xl backdrop-blur-lg border border-stroke-500 ring-2 ring-stroke-600/50 bg-tertiary-500 shadow-lg hover:shadow-2xl hover:shadow-white/20 hover:rotate-1   active:scale-100 active:rotate-0 transition-all duration-300 ease-out cursor-pointer active:border-secondary-500 hover:ring-secondary-500 hover:border-stroke-500/30  group relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-main-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>

            <div className="relative z-10 flex items-center justify-center gap-2">
              <FaPlay className="mb-0.5 w-6 h-6 fill-main-500  group-hover:fill-main-500/90 transition-colors duration-300" />
              START
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

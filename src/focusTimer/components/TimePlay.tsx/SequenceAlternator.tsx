import { IoIosCheckmark } from "react-icons/io";
import type { SequenceItem } from "./TimerContainer";
import { formatTime, getSequenceLabel } from "./TimerContainer";
import { IoPlaySkipForward } from "react-icons/io5";
import type { PlayerDesign } from "../../store/useUIStore";

type SequenceAlternatorProps = {
  sequence?: SequenceItem;
  isPast?: boolean;
  onSkip?: () => void;
  activePlayerDesign: PlayerDesign;
  showTimer: boolean;
  activeTimerObjectElement?: React.ReactElement | null;
};

export default function SequenceAlternator(
  props: SequenceAlternatorProps = {
    activePlayerDesign: "Default",
    showTimer: true,
  }
) {
  // If no sequence provided, render empty (for no-breaks mode)
  if (!props.sequence) {
    return (
      <div className="w-10 h-10 xs:w-16 xs:h-16 sm:w-22 sm:h-22 xs:block hidden"></div>
    );
  }

  const { sequence, isPast, onSkip } = props;
  const isFutureSequence = !isPast;
  const isPastSequence = isPast === true;
  const { hours, min } = formatTime(sequence.duration);

  return (
    <div
      className={`w-5 h-5 xs:w-16 xs:h-16 sm:w-22 sm:h-22 aspect-square  text-tertiary-400 cursor-default  ${
        isFutureSequence && onSkip
          ? "group hover:opacity-100 cursor-pointer"
          : "bg-main-400/10 opacity-40 border-stroke-500/40"
      }
      ${
        props.activePlayerDesign === "Default"
          ? "rounded-full p-1 bg-main-400 border border-stroke-500"
          : "rounded-sm bg-transparent!"
      }
      ${isPastSequence ? "xs:block hidden" : ""}
      `}
    >
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center  p-2 transition-all duration-300 rounded-full`}
        onClick={() => isFutureSequence && onSkip && onSkip()}
      >
        {isFutureSequence && onSkip && (
          <div
            className={`absolute inset-0 flex items-center justify-center z-10 xs:opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              props.activePlayerDesign === "Default"
                ? "rounded-full"
                : "rounded-sm"
            }`}
          >
            <span
              className={`p-2 ${
                props.activePlayerDesign === "Default"
                  ? "rounded-full border border-stroke-500 bg-main-300/95"
                  : "rounded-sm bg-main-300/85"
              }`}
            >
              <IoPlaySkipForward className="text-tertiary-500 text-xs xs:text-lg" />
            </span>
          </div>
        )}
        {props.showTimer ? (
          <div className="sm:font-bold font-light font-archivo text-base sm:text-xl sm:leading-7 xs:block hidden">
            {hours > 0 && (
              <>
                {hours} :{/* <span className="text-xs">h</span> */}
              </>
            )}
            {min}
            {/* <span className="text-[9px] text-tertiary-400"> min</span> */}
          </div>
        ) : (
          <div className={`max-w-[28px] mb-1 hidden sm:block`}>
            {props.activeTimerObjectElement}
          </div>
        )}
        <div className="text-[8px] xs:block hidden text-center font-light mb-0.5 uppercase tracking-widest sm:text-nowrap">
          {getSequenceLabel(sequence.type)}
        </div>
        {isPastSequence && (
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-3  ${
              props.activePlayerDesign === "Default"
                ? "rounded-full bg-main-300/85"
                : "rounded-sm bg-main-300/85"
            }`}
          >
            <IoIosCheckmark className="text-tertiary-400 text-4xl" />
          </div>
        )}
      </div>
    </div>
  );
}

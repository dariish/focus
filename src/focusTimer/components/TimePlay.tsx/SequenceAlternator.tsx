import { IoIosCheckmark } from "react-icons/io";
import type { SequenceItem } from "./TimerContainer";
import {
  formatTime,
  getSequenceLabel,
  getSequenceIcon,
} from "./TimerContainer";
import { IoPlaySkipForward } from "react-icons/io5";

type SequenceAlternatorProps = {
  sequences?: SequenceItem[];
  isPast?: boolean;
  onSkip?: () => void;
};

export default function SequenceAlternator(
  props: SequenceAlternatorProps = {}
) {
  // If no sequences provided, render empty (for no-breaks mode)
  if (!props.sequences) {
    return (
      <div className="w-22 h-22 rounded-full p-1 bg-main-400 border border-stroke-500 opacity-20 text-tertiary-400"></div>
    );
  }

  const { sequences, isPast, onSkip } = props;

  const isFutureSequence = !isPast;

  return (
    <div className="w-22 h-22 rounded-full p-1 bg-main-400 border border-stroke-500 text-tertiary-400">
      {sequences.map((seq, index) => {
        const isPastSequence = isPast === true;
        const { hours, min } = formatTime(seq.duration);

        return (
          <div
            key={index}
            className={`
              relative w-full h-full flex flex-col items-center justify-center  p-2 transition-all duration-300 rounded-full cursor-default
              ${
                isFutureSequence && onSkip
                  ? "group hover:opacity-100 cursor-pointer"
                  : ""
              }
            `}
            onClick={() => isFutureSequence && onSkip && onSkip()}
          >
            {/* Skip overlay - only for future sequences with skip functionality */}
            {isFutureSequence && onSkip && (
              <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-main-200/40 rounded-full duration-300">
                <span className="rounded-xs bg-main-300/90 border border-stroke-500 p-1  font-semibold text-xs tracking-wide">
                  <IoPlaySkipForward className="text-tertiary-500 text-lg" />
                </span>
              </div>
            )}
            {/* <div className="text-lg mb-1">{getSequenceIcon(seq.type)}</div> */}
            <div className="font-bold font-archivo text-xl  leading-7">
              {hours > 0 && (
                <>
                  {hours} :{/* <span className="text-xs">h</span> */}
                </>
              )}
              {min}
              {/* <span className="text-[9px] text-tertiary-400"> min</span> */}
            </div>
            <div className="text-[9px] text-center font-light mb-0.5 uppercase tracking-widest">
              {getSequenceLabel(seq.type)}
            </div>

            {/* Progress bar - only show for past sequences */}
            {isPastSequence && (
              <div className="absolute inset-0 flex items-center justify-center z-5 bg-main-400/75 rounded-full">
                <IoIosCheckmark className="text-tertiary-500 text-6xl" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

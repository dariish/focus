import { useEffect, useRef } from "react";
import type { SequenceItem } from "./TimerContainer";
import TimerEmpty from "../../../assets/timer_empty.svg?react";
import TimerFull from "../../../assets/timer_filled.svg?react";

type BreakIconProps = {
  type: "smallBreak" | "bigBreak";
  isPast: boolean;
  isLast: boolean;
  isFreeMode: boolean;
};

function BreakIcon({ type, isPast, isLast, isFreeMode }: BreakIconProps) {
  const colorClass = isPast ? "bg-contrast-600" : "bg-tertiary-500";

  // Define segments: [width classes, height classes] - responsive with sm: breakpoint
  const segments: Array<[string, string]> = [
    ["w-1.5 sm:w-2.5", "h-px"], // Start horizontal line
    ["w-px", "h-1.5"], // Vertical line
  ];

  // Add middle segment for big break
  if (type === "bigBreak") {
    segments.push(["w-0.5 sm:w-1", "h-px"]); // Small horizontal
    segments.push(["w-px", "h-1.5"]); // Another vertical
  }
  if (!isLast || isFreeMode) {
    segments.push(["w-1.5 sm:w-2.5", "h-px"]); // End horizontal line
  }

  return (
    <div className="flex items-center justify-center">
      {segments.map(([width, height], i) => (
        <span
          key={i}
          className={`${width} ${height} rounded-full ${colorClass}`}
        />
      ))}
    </div>
  );
}

export default function AllSequencesDisplay({
  sequences,
  currentIndex,
  isFreeMode,
}: {
  sequences: SequenceItem[];
  currentIndex: number;
  isFreeMode: boolean;
}) {
  const currentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll current sequence into view and center it
  useEffect(() => {
    if (currentRef.current && containerRef.current) {
      currentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  return (
    <div ref={containerRef} className="flex overflow-x-auto no-scrollbar">
      {sequences.map((seq, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={index}
            ref={isCurrent ? currentRef : null}
            className={`flex items-center border border-transparent rounded-sm py-1.5 px-0.5 sm:mx-0.5 transition-all duration-200 ${
              isCurrent ? "bg-main-400 border border-stroke-500!" : ""
            }
                `}
          >
            {seq.type === "focus" ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {isPast ? (
                  <TimerFull className="w-full h-full text-contrast-600" />
                ) : (
                  <TimerEmpty
                    className={`w-full h-full text-tertiary-500 ${
                      isCurrent ? "scale-90" : ""
                    }`}
                  />
                )}
              </div>
            ) : (
              <BreakIcon
                type={seq.type}
                isPast={isPast}
                isLast={index === sequences.length - 1}
                isFreeMode={isFreeMode}
              />
            )}
          </div>
        );
      })}
      {/* Infinite indicator for free mode */}
      {isFreeMode && (
        <div className="flex items-center mx-1">
          <span className="w-1 h-0.5 rounded-full bg-tertiary-400 -ml-0.5 mr-0.5"></span>
          <span className="w-0.5 h-0.5 rounded-full bg-tertiary-400 mr-0.5"></span>
          <span className="w-0.5 h-0.5 rounded-full bg-tertiary-400"></span>
        </div>
      )}
    </div>
  );
}

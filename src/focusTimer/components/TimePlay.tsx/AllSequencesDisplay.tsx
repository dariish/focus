import { useEffect, useRef } from "react";
import type { SequenceItem } from "./TimerContainer";
import TimerEmpty from "../../../assets/timer_empty.svg?react";
import TimerFull from "../../../assets/timer_filled.svg?react";

type BreakIconProps = {
  type: "smallBreak" | "bigBreak";
  isPast: boolean;
  isLast: boolean;
};

function BreakIcon({ type, isPast, isLast }: BreakIconProps) {
  const colorClass = isPast ? "bg-contrast-600" : "bg-tertiary-500";

  // Define segments: [width, height]
  const segments: Array<[string, string]> = [
    ["w-2", "h-0.5"], // Start horizontal line
    ["w-0.5", "h-2"], // Vertical line
  ];

  // Add middle segment for big break
  if (type === "bigBreak") {
    segments.push(["w-1", "h-0.5"]); // Small horizontal
    segments.push(["w-0.5", "h-2"]); // Another vertical
  }
  if (!isLast) {
    segments.push(["w-2", "h-0.5"]); // End horizontal line
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
}: {
  sequences: SequenceItem[];
  currentIndex: number;
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
    <div className="w-full max-w-sm flex items-center justify-center mt-6">
      <div ref={containerRef} className="flex overflow-x-auto no-scrollbar">
        {sequences.map((seq, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div
              key={index}
              ref={isCurrent ? currentRef : null}
              className={`
                  flex items-center rounded-sm transition-all duration-200
                  ${isCurrent ? "bg-main-500" : ""}
                `}
            >
              {/* Timer icon - only for focus sequences */}
              {seq.type === "focus" ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  {isPast ? (
                    <TimerFull className="w-full h-full mx-0.5 text-contrast-600" />
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
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

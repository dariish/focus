import {
  useUIStore,
  type PlayerDesign,
  type TimerFormat,
} from "../../store/useUIStore";
import { getSequenceLabel } from "./TimerContainer";

type SequenceType = "focus" | "smallBreak" | "bigBreak";

function formatTime(
  seconds: number,
  format: TimerFormat
): { time: string; showMin: boolean } {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  switch (format) {
    case "h:m:s":
      return {
        time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(secs).padStart(2, "0")}`,
        showMin: false,
      };
    case "m:s":
      const totalMinutes = Math.floor(seconds / 60);
      return {
        time: `${String(totalMinutes).padStart(2, "0")}:${String(secs).padStart(
          2,
          "0"
        )}`,
        showMin: false,
      };
    case "h:m":
      return {
        time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}`,
        showMin: false,
      };
    case "m":
      return {
        time: String(Math.floor(seconds / 60)),
        showMin: true,
      };
    default:
      return {
        time: String(Math.floor(seconds / 60)),
        showMin: true,
      };
  }
}

function TimerInnerContainer({
  children,
  progress,
  activePlayerDesign,
}: {
  children: React.ReactNode;
  progress: number;
  activePlayerDesign: PlayerDesign;
}) {
  const numLines = 28;
  const angleStep = 360 / numLines;
  const innerRadius = 44; // Distance from center to inner end of line
  const outerRadius = 47; // Distance from center to outer end of line

  // Calculate how many lines should be filled (orange) based on progress
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const numFilledLines = Math.floor((clampedProgress / 100) * numLines);

  return (
    <div
      className={`flex items-center justify-center relative aspect-square ${
        activePlayerDesign === "Minimalistic" ? "p-2" : "p-14 xs:p-16"
      }`}
    >
      {/* Outer border circle */}
      {activePlayerDesign === "Default" && (
        <>
          <svg viewBox="0 0 100 100" className="absolute inset-0">
            <circle
              cx="50"
              cy="50"
              r="48.5"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-main-400 stroke-stroke-500"
            />
          </svg>

          <svg viewBox="0 0 100 100" className="absolute inset-3">
            <g
              transform="translate(50 50)"
              strokeLinecap="round"
              style={{ strokeWidth: "2" }}
            >
              {Array.from({ length: numLines }).map((_, i) => {
                const angle = i * angleStep;
                const isFilled = i < numFilledLines;
                const isNextLine =
                  i === numFilledLines && numFilledLines < numLines;

                // Special lines every 7th position (0, 7, 14, 21) have shorter inner radius
                const isSpecialLine = i % 7 === 0;

                return (
                  <line
                    key={i}
                    y1={-outerRadius}
                    y2={isSpecialLine ? -40 : -innerRadius}
                    transform={`rotate(${angle})`}
                    stroke="currentColor"
                    className={`${
                      isFilled
                        ? "text-tertiary-500 transition-all duration-1000"
                        : isNextLine
                        ? "text-contrast-600"
                        : "text-main-750"
                    }`}
                  />
                );
              })}
            </g>
          </svg>
        </>
      )}
      {children}
    </div>
  );
}

export default function TimerInner({
  seconds,
  currentSequenceType,
  progress,
  activePlayerDesign,
  showTimer,
  activeTimerObjectElement,
}: {
  seconds: number;
  currentSequenceType: SequenceType | null;
  progress: number;
  activePlayerDesign: PlayerDesign;
  showTimer: boolean;
  activeTimerObjectElement: React.ReactElement | null;
}) {
  const activeTimerFormat = useUIStore((s) => s.activeTimerFormat) || "m:s";
  const { time: formattedTime, showMin } = formatTime(
    seconds,
    activeTimerFormat
  );

  return (
    <TimerInnerContainer
      activePlayerDesign={activePlayerDesign}
      progress={progress}
    >
      <div
        className={`flex items-center justify-between sm:justify-center w-full h-full aspect-square z-2  ${
          activePlayerDesign === "Default"
            ? "min-w-[110px] xs:min-w-[160px] sm:min-w-[230px]"
            : ""
        }`}
      >
        <div className="relative flex flex-col items-center justify-center font-bold font-archivo tabular-nums text-center w-full">
          {!showTimer && activeTimerObjectElement !== null && (
            <div className={`max-w-[50px] sm:max-w-[100px] animate-pulse`}>
              {activeTimerObjectElement}
            </div>
          )}
          {showTimer && (
            <p
              className={`relative flex items-end gap-1 ${
                activePlayerDesign === "Minimalistic"
                  ? showMin
                    ? "text-6xl! xs:text-8xl!"
                    : "text-5xl! sm:text-7xl!"
                  : showMin
                  ? "text-4xl xs:text-5xl"
                  : "text-2xl xs:text-4xl sm:text-5xl"
              }`}
            >
              {formattedTime}{" "}
              {showMin && (
                <span
                  className={`  font-light font-inter text-tertiary-400 ${
                    activePlayerDesign === "Minimalistic"
                      ? "text-2xl! xs:text-4xl! mb-0.5 xs:mb-2"
                      : "xs:text-xl text-sm xs:mb-0 mb-[2px]"
                  }`}
                >
                  min
                </span>
              )}
            </p>
          )}
          {currentSequenceType && (
            <div
              className={`${
                showTimer || activeTimerObjectElement !== null
                  ? "absolute top-full left-1/2 -translate-x-1/2 text-base"
                  : "text-2xl! text-tertiary-500!"
              }  ${
                activePlayerDesign === "Minimalistic" && showMin ? "mt-2!" : ""
              } mt-1 text-contrast-500 text-xs sm:text-base font-light text-nowrap`}
            >
              {getSequenceLabel(currentSequenceType)}
            </div>
          )}
        </div>
      </div>
    </TimerInnerContainer>
  );
}

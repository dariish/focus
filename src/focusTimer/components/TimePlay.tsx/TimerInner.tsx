import { getSequenceLabel } from "./TimerContainer";

type SequenceType = "focus" | "smallBreak" | "bigBreak";

function TimerInnerContainer({
  children,
  progress,
}: {
  children: React.ReactNode;
  progress: number;
}) {
  const numLines = 28;
  const angleStep = 360 / numLines;
  const innerRadius = 44; // Distance from center to inner end of line
  const outerRadius = 47; // Distance from center to outer end of line

  // Calculate how many lines should be filled (orange) based on progress
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const numFilledLines = Math.floor((clampedProgress / 100) * numLines);

  return (
    <div className="flex items-center justify-center p-16 relative aspect-square">
      {/* Outer border circle */}
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
      {/* Progress lines */}
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
      {children}
    </div>
  );
}

export default function TimerInner({
  seconds,
  currentSequenceType,
  progress,
}: {
  seconds: number;
  currentSequenceType: SequenceType | null;
  progress: number;
}) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <TimerInnerContainer progress={progress}>
      <div className="flex flex-col items-center justify-center gap-1 pt-3 w-full h-full z-2">
        <div className="text-5xl font-bold font-archivo tabular-nums text-center min-w-[230px]">
          {mm}:{ss}
        </div>
        {currentSequenceType && (
          <div className="text-tertiary-400 uppercase tracking-wider">
            {getSequenceLabel(currentSequenceType)}
          </div>
        )}
      </div>
    </TimerInnerContainer>
  );
}

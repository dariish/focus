import { useMemo } from "react";

type SegmentType = "focus" | "smallInterval" | "bigInterval";

type Segment = {
  type: SegmentType;
  minutes: number;
  percent: number;
  timeSoFar: string | null;
};

type TimeBarProps = {
  totalTime: number;
  focusTime: number;
  smallIntervalTime: number;
  bigIntervalTime: number;
  sequence: number;
};

const defaultSegmentStyles: Record<SegmentType, string> = {
  focus: "bg-tertiary-500",
  smallInterval: "bg-tertiary-400",
  bigInterval: "bg-tertiary-400",
};

export default function TimeBar({
  totalTime,
  focusTime,
  smallIntervalTime,
  bigIntervalTime,
  sequence,
}: TimeBarProps) {
  const updatedTime = totalTime <= 0 ? 10800 : totalTime;

  const totalTimeMinutes = updatedTime / 60;
  const focusTimeMinutes = focusTime / 60;
  const smallIntervalTimeMinutes = smallIntervalTime / 60;
  const bigIntervalTimeMinutes = bigIntervalTime / 60;

  const segmentStyles: Record<SegmentType, string> = {
    focus: defaultSegmentStyles.focus,
    smallInterval: defaultSegmentStyles.smallInterval,
    bigInterval: defaultSegmentStyles.bigInterval,
  };

  const formatMinutesToTimeString = (minutes: number): string => {
    if (minutes <= 0) return "0";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);

    if (hours === 0) {
      return `${remainingMinutes}`;
    }

    return remainingMinutes === 0
      ? `${hours}h`
      : `${hours}h${remainingMinutes}`;
  };

  const segments = useMemo(() => {
    if (totalTimeMinutes <= 0) return [];

    const generated: Segment[] = [];
    let remaining = totalTimeMinutes;
    let focusCount = 0;
    let timeSoFarCount = 0;

    const addSegment = (
      type: SegmentType,
      minutes: number,
      timeSoFar?: number | null
    ) => {
      if (minutes <= 0) return;

      generated.push({
        type,
        minutes,
        percent: (minutes / totalTimeMinutes) * 100,
        timeSoFar:
          typeof timeSoFar === "number"
            ? formatMinutesToTimeString(timeSoFar)
            : null,
      });
    };

    while (remaining > 0) {
      const focusDuration = Math.min(focusTimeMinutes, remaining);
      timeSoFarCount += focusDuration;
      addSegment("focus", focusDuration, timeSoFarCount);
      remaining -= focusDuration;
      if (remaining <= 0) break;

      focusCount += 1;
      const isBigBreak = sequence > 0 && focusCount % sequence === 0;
      const breakDuration = isBigBreak
        ? bigIntervalTimeMinutes
        : smallIntervalTimeMinutes;
      const appliedBreak = Math.min(breakDuration, remaining);
      timeSoFarCount += appliedBreak;
      addSegment(
        isBigBreak ? "bigInterval" : "smallInterval",
        appliedBreak,
        null
      );
      remaining -= appliedBreak;
    }
    return generated;
  }, [
    totalTimeMinutes,
    focusTimeMinutes,
    smallIntervalTimeMinutes,
    bigIntervalTimeMinutes,
    sequence,
  ]);

  if (segments.length === 0) {
    return (
      <div className="w-full h-4 bg-stroke-300">
        <span className="sr-only">No time configured</span>
      </div>
    );
  }

  return (
    <div className="w-full flex h-4 overflow-hidden">
      {segments.map((segment, index) => (
        <div
          key={`${segment.type}-${index}`}
          className={`h-full flex flex-col items-end ml-[4px] duration-200 ${
            index === 0 ? "ml-0" : ""
          }`}
          style={{ width: `${segment.percent}%` }}
          title={`${segment.type} – ${segment.minutes} min`}
        >
          <div
            className={`${
              segmentStyles[segment.type]
            } duration-500 transition-all w-full h-full`}
          ></div>
          <span
            className={`text-[8px] font-light  ${
              segment.timeSoFar ? "" : "opacity-0"
            }`}
          >
            {segment.timeSoFar ?? 0}
          </span>
        </div>
      ))}
      {totalTime === 0 && (
        <div className="ml-1 w-1/16 flex flex-col items-end">
          <div className="flex items-center gap-1 h-1 w-full">
            <span className="w-full h-1 bg-tertiary-400/80"></span>
            <span className="w-full h-1 bg-tertiary-400/60"></span>
            <span className="w-full h-1 bg-tertiary-400/40"></span>
          </div>
          <span className="text-[8px] font-light self-end">∞</span>
        </div>
      )}
    </div>
  );
}

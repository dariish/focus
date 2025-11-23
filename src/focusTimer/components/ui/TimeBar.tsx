import { useMemo } from "react";

type SegmentType = "focus" | "smallInterval" | "bigInterval";

type Segment = {
  type: SegmentType;
  minutes: number;
  percent: number;
  timeSoFar: string | null;
};

type TimeBarProps = {
  onHover: boolean;
  totalTime: number;
  focusTime: number;
  smallIntervalTime: number;
  bigIntervalTime: number;
  sequence: number;
};

const defaultSegmentStyles: Record<SegmentType, string> = {
  focus: "bg-secondary-600",
  smallInterval: "bg-contrast-500",
  bigInterval: "bg-contrast-500",
};

export default function TimeBar({
  onHover,
  totalTime,
  focusTime,
  smallIntervalTime,
  bigIntervalTime,
  sequence,
}: TimeBarProps) {
  //TIME IS IN MINUTES!
  const segmentStyles: Record<SegmentType, string> = {
    focus: defaultSegmentStyles.focus,
    smallInterval: defaultSegmentStyles.smallInterval,
    bigInterval: defaultSegmentStyles.bigInterval,
  };

  const formatMinutesToTimeString = (minutes: number): string => {
    if (minutes <= 0) return "0";

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes}`;
    }

    return remainingMinutes === 0
      ? `${hours}h`
      : `${hours}h${remainingMinutes}`;
  };

  const segments = useMemo(() => {
    if (totalTime <= 0) return [];

    const generated: Segment[] = [];
    let remaining = totalTime;
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
        percent: (minutes / totalTime) * 100,
        timeSoFar:
          typeof timeSoFar === "number"
            ? formatMinutesToTimeString(timeSoFar)
            : null,
      });
    };

    while (remaining > 0) {
      const focusDuration = Math.min(focusTime, remaining);
      timeSoFarCount += focusDuration;
      addSegment("focus", focusDuration, timeSoFarCount);
      remaining -= focusDuration;
      if (remaining <= 0) break;

      focusCount += 1;
      const isBigBreak = sequence > 0 && focusCount % sequence === 0;
      const breakDuration = isBigBreak ? bigIntervalTime : smallIntervalTime;
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
  }, [totalTime, focusTime, smallIntervalTime, bigIntervalTime, sequence]);

  if (segments.length === 0) {
    return (
      <div className="w-full h-4 rounded-full bg-stroke-300">
        <span className="sr-only">No time configured</span>
      </div>
    );
  }

  return (
    <div className="w-full flex  h-4">
      {segments.map((segment, index) => (
        <div
          key={`${segment.type}-${index}`}
          className={`h-full flex flex-col items-end ml-[2px] duration-200 ${
            index === 0 ? "ml-0" : ""
          }`}
          style={{ width: `${segment.percent}%` }}
          title={`${segment.type} – ${segment.minutes} min`}
        >
          <div
            className={`${
              segmentStyles[segment.type]
            } duration-500 transition-all ${
              onHover ? "scale-x-106 " : ""
            } rounded-sm w-full h-full`}
          ></div>
          <span
            className={`text-[8px] font-light ${onHover ? " " : ""} ${
              segment.timeSoFar ? "" : "opacity-0"
            }`}
          >
            {segment.timeSoFar ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}

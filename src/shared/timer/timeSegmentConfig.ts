import type { inputTimeSegmentType } from "./TimeSegmentInput";

export const formatTypes = [
  "s",
  "min",
  "h",
  "d",
  "m",
  "y",
  "min:s",
  "h:min",
  "h:min:s",
  "d:h:min:s",
  "m:d:h:min:s",
  "y:m:d:h:min:s",
] as const;

function formulateSegment(
  id: number,
  segment: inputTimeSegmentType["segment"],
  initialValue: number,
  digits: number = 2,
  max: number | null,
  min: number | null,
  hasNextNumber?: number | null
): inputTimeSegmentType {
  const secondary = hasNextNumber
    ? { active: true, loopMax: hasNextNumber }
    : { active: false, loopMax: 0 };
  return {
    id,
    segment,
    globalValue: initialValue,
    allwaysShowDigits: digits,
    range: { max, min },
    hasNext: secondary,
    onFocus: () => {},
  };
}
//Max value -> digits, only applies to the primary elemnent
// null Max value -> for any secondary segment.
export function FORMAT_INITIAL_CONFIGS(
  format: (typeof formatTypes)[number],
  initialValue: Record<string, number>,
  maxRange: Record<string, number | null> | null,
  minRange: Record<string, number | null> | null
) {
  switch (format) {
    case "s":
      return [
        formulateSegment(
          0,
          "s",
          initialValue.s,
          2,
          maxRange?.s ?? null,
          minRange?.s ?? null
        ),
      ];
    case "min":
      return [
        formulateSegment(
          0,
          "min",
          initialValue.min,
          2,
          maxRange?.min ?? null,
          minRange?.min ?? null
        ),
      ];
    case "h":
      return [
        formulateSegment(
          0,
          "h",
          initialValue.h,
          2,
          maxRange?.h ?? null,
          minRange?.h ?? null
        ),
      ];
    case "d":
      return [
        formulateSegment(
          0,
          "d",
          initialValue.d,
          1,
          maxRange?.d ?? null,
          minRange?.d ?? null
        ),
      ];
    case "m":
      return [
        formulateSegment(
          0,
          "m",
          initialValue.m,
          2,
          maxRange?.m ?? null,
          minRange?.m ?? null
        ),
      ];
    case "y":
      return [
        formulateSegment(
          0,
          "y",
          initialValue.y,
          1,
          maxRange?.y ?? null,
          minRange?.y ?? null
        ),
      ];
    case "min:s":
      return [
        formulateSegment(
          0,
          "min",
          initialValue.min,
          2,
          maxRange?.min ?? null,
          minRange?.min ?? null
        ),
        formulateSegment(1, "s", initialValue.s, 2, null, null, 59),
      ];
    case "h:min":
      return [
        formulateSegment(
          0,
          "h",
          initialValue.h,
          2,
          maxRange?.h ?? null,
          minRange?.h ?? null
        ),
        formulateSegment(1, "min", initialValue.min, 2, null, null, 59),
      ];
    case "h:min:s":
      return [
        formulateSegment(
          0,
          "h",
          initialValue.h,
          2,
          maxRange?.h ?? null,
          minRange?.h ?? null
        ),
        formulateSegment(1, "min", initialValue.min, 2, null, null, 59),
        formulateSegment(2, "s", initialValue.s, 2, null, null, 59),
      ];
    case "d:h:min:s":
      return [
        formulateSegment(
          0,
          "d",
          initialValue.d,
          2,
          maxRange?.d ?? null,
          minRange?.d ?? null
        ),
        formulateSegment(1, "h", initialValue.h, 2, null, null, 23),
        formulateSegment(2, "min", initialValue.min, 2, null, null, 59),
        formulateSegment(3, "s", initialValue.s, 2, null, null, 59),
      ];

    case "m:d:h:min:s":
      return [
        formulateSegment(
          0,
          "m",
          initialValue.m,
          2,
          maxRange?.m ?? null,
          minRange?.m ?? null
        ),
        formulateSegment(1, "d", initialValue.d, 1, null, null, 6),
        formulateSegment(2, "h", initialValue.h, 2, null, null, 23),
        formulateSegment(3, "min", initialValue.min, 2, null, null, 59),
        formulateSegment(4, "s", initialValue.s, 2, null, null, 59),
      ];
    case "y:m:d:h:min:s":
      return [
        formulateSegment(
          0,
          "y",
          initialValue.y,
          1,
          maxRange?.y ?? null,
          minRange?.y ?? null
        ),
        formulateSegment(1, "m", initialValue.m, 2, null, null, 11),
        formulateSegment(2, "d", initialValue.d, 1, null, null, 6),
        formulateSegment(3, "h", initialValue.h, 2, null, null, 23),
        formulateSegment(4, "min", initialValue.min, 2, null, null, 59),
        formulateSegment(5, "s", initialValue.s, 2, null, null, 59),
      ];

    default:
      return [
        formulateSegment(
          0,
          "h",
          initialValue.h,
          2,
          maxRange?.h ?? null,
          minRange?.h ?? null
        ),
        formulateSegment(1, "min", initialValue.min, 2, null, null, 59),
      ];
  }
}

export const UNIT_TO_SECONDS = {
  s: 1,
  min: 60,
  h: 3600,
  d: 86400,
  m: 2592000,
  y: 31536000,
} as const;

export const UNIT_TOP = {
  s: 59,
  min: 59,
  h: 23,
  d: 30,
  m: 11,
  y: 1,
} as const;

export function calculateRangeSegment(
  format: string,
  totalSeconds: number
): Record<string, number> {
  const SEC_IN_MIN = 60;
  const SEC_IN_HOUR = 60 * SEC_IN_MIN;
  const SEC_IN_DAY = 24 * SEC_IN_HOUR;
  const SEC_IN_MONTH = 30 * SEC_IN_DAY;
  const SEC_IN_YEAR = 365 * SEC_IN_DAY;

  switch (format) {
    case "s":
      return { s: totalSeconds };

    case "min":
      return { min: totalSeconds / SEC_IN_MIN };

    case "h":
      return { h: totalSeconds / SEC_IN_HOUR };

    case "d":
      return { d: totalSeconds / SEC_IN_DAY };

    case "m":
      return { m: totalSeconds / SEC_IN_MONTH };

    case "y":
      return { y: totalSeconds / SEC_IN_YEAR };

    case "min:s": {
      let remaining = totalSeconds;
      const min = Math.floor(remaining / SEC_IN_MIN);
      remaining %= SEC_IN_MIN;
      const s = remaining;
      return { min, s };
    }

    case "h:min": {
      let remaining = totalSeconds;
      const h = Math.floor(remaining / SEC_IN_HOUR);
      remaining %= SEC_IN_HOUR;
      const min = Math.floor(remaining / SEC_IN_MIN);
      return { h, min };
    }

    case "h:min:s": {
      let remaining = totalSeconds;
      const h = Math.floor(remaining / SEC_IN_HOUR);
      remaining %= SEC_IN_HOUR;
      const min = Math.floor(remaining / SEC_IN_MIN);
      const s = remaining % SEC_IN_MIN;
      return { h, min, s };
    }

    case "d:h:min:s": {
      let remaining = totalSeconds;
      const d = Math.floor(remaining / SEC_IN_DAY);
      remaining %= SEC_IN_DAY;
      const h = Math.floor(remaining / SEC_IN_HOUR);
      remaining %= SEC_IN_HOUR;
      const min = Math.floor(remaining / SEC_IN_MIN);
      const s = remaining % SEC_IN_MIN;
      return { d, h, min, s };
    }

    case "m:d:h:min:s": {
      let remaining = totalSeconds;
      const m = Math.floor(remaining / SEC_IN_MONTH);
      remaining %= SEC_IN_MONTH;
      const d = Math.floor(remaining / SEC_IN_DAY);
      remaining %= SEC_IN_DAY;
      const h = Math.floor(remaining / SEC_IN_HOUR);
      remaining %= SEC_IN_HOUR;
      const min = Math.floor(remaining / SEC_IN_MIN);
      const s = remaining % SEC_IN_MIN;
      return { m, d, h, min, s };
    }

    case "y:m:d:h:min:s": {
      let remaining = totalSeconds;
      const y = Math.floor(remaining / SEC_IN_YEAR);
      remaining %= SEC_IN_YEAR;
      const m = Math.floor(remaining / SEC_IN_MONTH);
      remaining %= SEC_IN_MONTH;
      const d = Math.floor(remaining / SEC_IN_DAY);
      remaining %= SEC_IN_DAY;
      const h = Math.floor(remaining / SEC_IN_HOUR);
      remaining %= SEC_IN_HOUR;
      const min = Math.floor(remaining / SEC_IN_MIN);
      const s = remaining % SEC_IN_MIN;
      return { y, m, d, h, min, s };
    }
    default:
      return { s: totalSeconds };
  }
}

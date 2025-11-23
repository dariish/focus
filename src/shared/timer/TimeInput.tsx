import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import TimeSegmentInput, {
  type inputTimeSegmentType,
} from "./TimeSegmentInput";
import {
  calculateRangeSegment,
  FORMAT_INITIAL_CONFIGS,
  UNIT_TO_SECONDS,
  type formatTypes,
} from "./timeSegmentConfig";

export type inputTimeType = {
  range?: { min: number; max: number };
  format: {
    type: (typeof formatTypes)[number];
    dots: boolean;
    custom?: Partial<inputTimeSegmentType>[] | null;
  };
  initialValue?: number;
  sendValue: (val: number) => void;
  debounceMs?: number;
};

type SegmentState = {
  value: number;
  max: number | null;
  min: number | null;
};
type SegmentMap = Record<string, SegmentState>;

type RangeType = { min: number; max: number };
export type SegmentAction =
  | {
      type: "NUMBERS" | "STEPS";
      segment: string;
      value: number;
      allSegments: inputTimeSegmentType[];
      range: RangeType;
      fullFormat: (typeof formatTypes)[number];
      id: number;
    }
  | {
      type: "RESET";
      nextSegments: SegmentMap;
      allSegments: inputTimeSegmentType[];
      range: RangeType;
      fullFormat: (typeof formatTypes)[number];
    };

export type SegmentActionFromChildren = {
  type: "NUMBERS" | "STEPS";
  segment: string;
  value: number;
  id: number;
  goNext?: [boolean, boolean];
};

function updatesRangeValues(
  dynamicSegments: Record<string, SegmentState>,
  staticSegments: inputTimeSegmentType[],
  range: RangeType,
  fullFormat: (typeof formatTypes)[number]
): Record<string, SegmentState> {
  const newSegments: Record<string, SegmentState> =
    structuredClone(dynamicSegments);

  let totalSeconds = 0;
  function calculateTotalSec() {
    totalSeconds = 0;
    for (const seg of staticSegments) {
      const val = newSegments[seg.segment]?.value || 0;
      totalSeconds += val * UNIT_TO_SECONDS[seg.segment];
    }

    const remaingToMax = range.max > 0 ? range.max - totalSeconds : null;
    const remainToMin = range.min > 0 ? totalSeconds - range.min : null;

    return [remaingToMax, remainToMin];
  }

  let [remaingToMax, remainToMin] = calculateTotalSec();

  //Last resort clamp , if it hits here, something went wrong before.
  if (
    (remaingToMax !== null && remaingToMax < 0) ||
    (remainToMin !== null && remainToMin < 0)
  ) {
    const safeMax = range.max > 0 ? range.max : Infinity;
    const clampedSeconds = Math.max(range.min, Math.min(safeMax, totalSeconds));
    const clampedValues = calculateRangeSegment(fullFormat, clampedSeconds);
    for (const seg of staticSegments) {
      if (clampedValues[seg.segment] !== undefined) {
        newSegments[seg.segment].value = clampedValues[seg.segment];
      }
    }

    [remaingToMax, remainToMin] = calculateTotalSec();
  }

  if (remaingToMax !== null || remainToMin !== null) {
    for (const seg of staticSegments) {
      const currentValue = newSegments[seg.segment]?.value || 0;
      const unitSeconds = UNIT_TO_SECONDS[seg.segment];
      const otherTotal = totalSeconds - currentValue * unitSeconds;
      const loopMax = seg.hasNext?.active ? seg.hasNext.loopMax : null;

      const baseMax = seg.range?.max ?? null;
      let nextMax = baseMax;
      let hasMaxConstraint = baseMax !== null;

      if (range.max > 0) {
        const maxValueRaw = (range.max - otherTotal) / unitSeconds;
        const computedMax = Math.floor(Math.max(0, maxValueRaw));
        hasMaxConstraint = true;
        nextMax =
          nextMax !== null ? Math.min(nextMax, computedMax) : computedMax;
      }

      if (loopMax !== null && nextMax !== null) {
        if (nextMax >= loopMax) {
          // Range does not impose a tighter constraint than natural looping
          nextMax = baseMax !== null ? Math.min(baseMax, loopMax) : null;
          if (nextMax === loopMax && baseMax === null) {
            nextMax = null;
          }
        } else {
          nextMax = Math.min(nextMax, loopMax);
        }
      } else if (loopMax !== null && nextMax === null && baseMax !== null) {
        nextMax = Math.min(baseMax, loopMax);
      }

      if (!hasMaxConstraint) {
        nextMax = null;
      }

      const baseMin = seg.range?.min ?? (seg.hasNext?.active ? null : 0);
      let nextMin = baseMin;
      let hasMinConstraint = baseMin !== null;

      if (range.min > 0) {
        const minValueRaw = (range.min - otherTotal) / unitSeconds;
        const computedMin = Math.ceil(minValueRaw);
        if (computedMin > (baseMin ?? 0)) {
          hasMinConstraint = true;
          nextMin =
            nextMin !== null ? Math.max(nextMin, computedMin) : computedMin;
        }
      }

      if (!hasMinConstraint) {
        nextMin = null;
      } else if (nextMin !== null && loopMax !== null) {
        if (nextMin <= 0) {
          // loop can freely go below zero, so drop constraint
          nextMin = null;
        } else {
          nextMin = Math.min(nextMin, loopMax);
        }
      }

      if (nextMax !== null && nextMin !== null) {
        nextMin = Math.min(nextMin, nextMax);
      }

      if (nextMin !== null && nextMin < 0) {
        nextMin = 0;
      }

      newSegments[seg.segment].max = nextMax;
      newSegments[seg.segment].min = nextMin;
    }
  }

  return newSegments;
}

function calculateTotalSecondsFromSegments(
  segments: SegmentMap,
  timeSegments: inputTimeSegmentType[]
) {
  return timeSegments.reduce((total, segment) => {
    const value = segments[segment.segment]?.value || 0;
    return total + value * UNIT_TO_SECONDS[segment.segment];
  }, 0);
}

function buildSegmentState(timeSegments: inputTimeSegmentType[]): SegmentMap {
  return Object.fromEntries(
    timeSegments.map((seg) => [
      seg.segment,
      {
        value: seg.globalValue || 0,
        max: seg.range?.max ?? null,
        min: seg.range?.min ?? null,
      },
    ])
  );
}

function reducerSegments(
  state: SegmentMap,
  action: SegmentAction
): Record<string, SegmentState> {
  switch (action.type) {
    case "NUMBERS": {
      const newState = {
        ...state,
        [action.segment]: {
          value: action.value,
          max: null,
          min: null,
        },
      };
      return updatesRangeValues(
        newState,
        action.allSegments,
        action.range,
        action.fullFormat
      );
    }
    case "STEPS": {
      const activeSeg = state[action.segment].value;
      let updatedValue = +activeSeg + action.value;
      const { min, max } = state[action.segment];

      if (max !== null) updatedValue = Math.min(max, updatedValue);
      if (min !== null) updatedValue = Math.max(min, updatedValue);

      if (updatedValue === activeSeg) return state;

      //Makes sure it loops
      const currentSegment = action.allSegments[action.id];

      if (currentSegment.hasNext?.active) {
        if (
          updatedValue > currentSegment.hasNext.loopMax &&
          currentSegment.range?.max === null
        ) {
          // 61 - 59 - 1 = 1

          updatedValue = updatedValue - currentSegment.hasNext.loopMax - 1;
          if (state[action.segment].min !== null) {
            updatedValue =
              updatedValue -
              currentSegment.hasNext.loopMax +
              (state[action.segment].min || 0) -
              1;
          }
        }

        if (updatedValue < 0 && currentSegment.range?.min === null) {
          updatedValue = currentSegment.hasNext.loopMax + 1 + updatedValue;
          if (state[action.segment].max !== null) {
            updatedValue = state[action.segment].max || 0;
          }
        }
      }
      const newState = {
        ...state,
        [action.segment]: {
          value: updatedValue,
          max: null,
          min: null,
        },
      };

      if (action.range.max === 0 && action.range.min === 0) return newState;

      return updatesRangeValues(
        newState,
        action.allSegments,
        action.range,
        action.fullFormat
      );
    }
    case "RESET": {
      return updatesRangeValues(
        action.nextSegments,
        action.allSegments,
        action.range,
        action.fullFormat
      );
    }
    default:
      return state;
  }
}

export default function TimeInput({
  range = { min: 0, max: 300 },
  format = { type: "min:s", dots: true, custom: null },
  initialValue = 100,
  sendValue,
  debounceMs = 300,
}: inputTimeType) {
  const clampedInitialValue = useMemo(() => {
    const max = range.max > 0 ? range.max : Infinity;
    return Math.max(range.min, Math.min(max, initialValue));
  }, [initialValue, range.max, range.min]);

  const maxValueRef = useRef(
    range.max > 0 ? calculateRangeSegment(format.type, range.max) : null
  );
  const minValueRef = useRef(
    range.min > 0 ? calculateRangeSegment(format.type, range.min) : null
  );

  const timeMapStatic = useMemo(
    () =>
      getFormatSegments(format.type, maxValueRef.current, minValueRef.current),
    [clampedInitialValue, format.custom, format.type]
  );

  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState(clampedInitialValue);

  const initialSegmentState = useMemo(
    () => buildSegmentState(timeMapStatic),
    [timeMapStatic]
  );

  const [segmentValues, dispatchSegments] = useReducer(
    reducerSegments,
    initialSegmentState,
    (initialState) =>
      updatesRangeValues(initialState, timeMapStatic, range, format.type)
  );

  const currentTotalSeconds = useMemo(
    () => calculateTotalSecondsFromSegments(segmentValues, timeMapStatic),
    [segmentValues, timeMapStatic]
  );

  const prevTotalSecondsRef = useRef(totalSeconds);
  const lastSentValueRef = useRef(totalSeconds);
  const lastInitialValueRef = useRef(clampedInitialValue);
  const isUserInputRef = useRef(false);
  const skipNextSendRef = useRef(false);

  useEffect(() => {
    if (clampedInitialValue !== lastInitialValueRef.current) {
      skipNextSendRef.current = true;
      const nextSegments = buildSegmentState(timeMapStatic);
      dispatchSegments({
        type: "RESET",
        nextSegments,
        allSegments: timeMapStatic,
        range: { max: range.max, min: range.min },
        fullFormat: format.type,
      });
      setTotalSeconds(clampedInitialValue);
      lastSentValueRef.current = clampedInitialValue;
      prevTotalSecondsRef.current = clampedInitialValue;
      lastInitialValueRef.current = clampedInitialValue;
      isUserInputRef.current = false;
    }
  }, [clampedInitialValue, format.type, range.max, range.min, timeMapStatic]);

  useEffect(() => {
    if (currentTotalSeconds !== totalSeconds) {
      isUserInputRef.current = true;
      skipNextSendRef.current = false;
      setTotalSeconds(currentTotalSeconds);
    }
  }, [currentTotalSeconds, totalSeconds]);

  useEffect(() => {
    const prevTotal = prevTotalSecondsRef.current;
    prevTotalSecondsRef.current = totalSeconds;

    if (totalSeconds === lastSentValueRef.current) {
      skipNextSendRef.current = false;
      return;
    }

    if (skipNextSendRef.current) {
      skipNextSendRef.current = false;
      return;
    }

    const isZeroTransition = totalSeconds === 0 || prevTotal === 0;

    if (isZeroTransition && isUserInputRef.current) {
      lastSentValueRef.current = totalSeconds;
      isUserInputRef.current = false;
      sendValue(totalSeconds);
      return;
    }

    if (isUserInputRef.current) {
      isUserInputRef.current = false;
    }

    const handler = setTimeout(() => {
      if (totalSeconds !== lastSentValueRef.current) {
        lastSentValueRef.current = totalSeconds;
        sendValue(totalSeconds);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [debounceMs, sendValue, totalSeconds]);

  function getFormatSegments(
    currentFormat: (typeof formatTypes)[number],
    maxSegments: Record<string, number> | null,
    minSegments: Record<string, number> | null
  ): inputTimeSegmentType[] {
    //Validate and clamp initialValue to range.
    const inValue = calculateRangeSegment(currentFormat, clampedInitialValue);

    //TODO, o max value, está a ser recalculado aqui!
    const baseConfig = FORMAT_INITIAL_CONFIGS(
      currentFormat,
      inValue,
      maxSegments,
      minSegments
    );

    //Applys customized settings, if there are any.
    let customizedBasedConfig = baseConfig;

    if (format.custom) {
      customizedBasedConfig = baseConfig.map((element, index) => {
        const customeOverride = format.custom?.[index];
        const newSegment = element;
        return customeOverride
          ? { ...newSegment, ...customeOverride }
          : newSegment;
      });
    }

    return customizedBasedConfig;
  }

  function onFocus(id: number) {
    setActiveSegmentId(id);
  }

  function onChange({
    type,
    segment,
    value,
    id,
    goNext,
  }: SegmentActionFromChildren) {
    dispatchSegments({
      type,
      segment,
      value,
      allSegments: timeMapStatic,
      range: { max: range.max, min: range.min },
      fullFormat: format.type,
      id,
    });

    if (
      goNext !== undefined &&
      goNext[0] &&
      goNext[1] &&
      id < timeMapStatic.length - 1
    ) {
      setActiveSegmentId(timeMapStatic[id + 1].id);
    } else if (goNext !== undefined && goNext[0] && !goNext[1] && id > 0) {
      setActiveSegmentId(timeMapStatic[id - 1].id);
    }
  }

  return (
    <div className="md:bg-main-400 md:rounded-sm md:border border-stroke-500  font-archivo flex items-center">
      {timeMapStatic.map((segmentProps, i) => (
        <div className="flex h-full" key={segmentProps.id}>
          <div className="">
            <TimeSegmentInput
              {...segmentProps}
              globalValue={segmentValues[segmentProps.segment].value}
              range={{
                max: segmentValues[segmentProps.segment].max,
                min: segmentValues[segmentProps.segment].min,
              }}
              dots={format.dots}
              onChange={onChange}
              isActive={activeSegmentId === segmentProps.id}
              onFocus={onFocus}
            />
          </div>
          {i < timeMapStatic.length - 1 && (
            <div className="w-px  mx-0.5 self-stretch bg-linear-to-b from-transparent via-stroke-500 to-transparent "></div>
          )}
        </div>
      ))}
    </div>
  );
}

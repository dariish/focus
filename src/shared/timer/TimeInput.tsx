import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import TimeSegmentInput, {
  type inputTimeSegmentType,
} from "./TimeSegmentInput";
import {
  calculateRangeSegment,
  FORMAT_INITIAL_CONFIGS,
  UNIT_TO_SECONDS,
  UNIT_TOP,
  type formatTypes,
} from "./timeSegmentConfig";

export type inputTimeType = {
  arrows?: boolean;
  range?: { min: number; max: number };
  format: {
    type: (typeof formatTypes)[number];
    dots: boolean;
    custom?: Partial<inputTimeSegmentType>[] | null;
  };
  initialValue?: number;
  steps?: number;
};

type SegmentState = {
  value: number;
  max: number | null;
  min: number | null;
};
type SegmentMap = Record<string, SegmentState>;

export type SegmentAction = {
  type: "NUMBERS" | "STEPS";
  segment: string;
  value: number;
  allSegments: inputTimeSegmentType[];
  range: { max: number; min: number };
  fullFormat: (typeof formatTypes)[number];
  id: number;
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
  range: { min: number; max: number },
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
    console.log(remaingToMax);
    console.log("SOMETHING WENT WRONG.");

    const clampedSeconds = Math.max(
      range.min,
      Math.min(range.max, totalSeconds)
    );
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
      if (seg.hasNext?.active) {
        const toMax =
          remaingToMax !== null
            ? Math.floor(
                remaingToMax / UNIT_TO_SECONDS[seg.segment] +
                  dynamicSegments[seg.segment]?.value
              )
            : null;

        const toMin =
          remainToMin !== null
            ? dynamicSegments[seg.segment]?.value -
              Math.floor(remainToMin / UNIT_TO_SECONDS[seg.segment])
            : null;

        if (toMax !== null) {
          newSegments[seg.segment].max =
            toMax < UNIT_TOP[seg.segment] ? toMax : null;
        }

        if (toMin !== null) {
          newSegments[seg.segment].min = toMin > 0 ? toMin : null;
        }
      }
    }
  }

  return newSegments;
}

function reducerSegments(
  state: SegmentMap,
  action: SegmentAction
): Record<string, SegmentState> {
  const activeSeg = state[action.segment].value;
  let newState = { ...state };

  switch (action.type) {
    case "NUMBERS":
      newState = {
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

    case "STEPS":
      let updatedValue = +activeSeg + action.value;
      const { min, max } = state[action.segment];

      if (max !== null) updatedValue = Math.min(max, updatedValue);
      if (min !== null) updatedValue = Math.max(min, updatedValue);

      console.log("updatedValue -> " + updatedValue);

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
      newState = {
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

  return state;
}

export default function TimeInput({
  arrows = false,
  range = { min: 0, max: 300 },
  format = { type: "min:s", dots: true, custom: null },
  initialValue = 100,
  steps = 1,
}: inputTimeType) {
  const maxValueRef = useRef(
    range.max > 0 ? calculateRangeSegment(format.type, range.max) : null
  );
  const minValueRef = useRef(
    range.min > 0 ? calculateRangeSegment(format.type, range.min) : null
  );

  const timeMapStatic = useMemo(
    () =>
      getFormatSegments(format.type, maxValueRef.current, minValueRef.current),
    [format.type]
  );

  const [activeSegmentId, setActiveSegmentId] = useState<number | null>(null);

  const [segmentValues, dispatchSegments] = useReducer(
    reducerSegments,
    Object.fromEntries(
      timeMapStatic.map((seg) => [
        seg.segment,
        {
          value: seg.globalValue || 0,
          max: seg.range?.max ?? null,
          min: seg.range?.min ?? null,
        },
      ])
    ),
    (initialState) =>
      updatesRangeValues(initialState, timeMapStatic, range, format.type)
  );

  function getFormatSegments(
    currentFormat: (typeof formatTypes)[number],
    maxSegments: Record<string, number> | null,
    minSegments: Record<string, number> | null
  ): inputTimeSegmentType[] {
    //Validate and clamp initialValue to range.
    const clampedInitial = Math.max(
      range.min,
      Math.min(range.max > 0 ? range.max : Infinity, initialValue)
    );
    const inValue = calculateRangeSegment(currentFormat, clampedInitial);

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
    <div className="bg-main-400 rounded-sm border border-stroke-500  font-archivo flex items-center">
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
            <div className="w-px self-stretch bg-linear-to-b from-transparent via-stroke-500 to-transparent "></div>
          )}
        </div>
      ))}
    </div>
  );
}

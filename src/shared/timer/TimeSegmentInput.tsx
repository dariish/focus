import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SegmentActionFromChildren } from "./TimeInput";
import { motion, AnimatePresence } from "framer-motion";
export type inputTimeSegmentType = {
  range?: { min: number | null; max: number | null };
  segment: "y" | "m" | "d" | "h" | "min" | "s";
  globalValue?: number;
  hasNext?: { active: boolean; loopMax: number };
  dots?: boolean;
  allwaysShowDigits?: number;
  id: number;
  isActive?: boolean;

  onChange?: (action: SegmentActionFromChildren) => void;
  onFocus: (id: number) => void;
};

export default function TimeSegmentInput({
  globalValue = 0,
  segment = "s",
  range = { min: null, max: null },
  hasNext = { active: false, loopMax: 59 },
  dots = true,
  allwaysShowDigits = 2,
  id,
  isActive = false,
  onChange,
  onFocus,
}: inputTimeSegmentType) {
  const inputRef = useRef<HTMLInputElement>(null);
  const typedCount = useRef(0);
  const [directionAnimation, setDirectionAnimation] = useState(1);

  useEffect(() => {
    if (isActive) inputRef.current?.focus();
  }, [isActive]);

  const { nextValue, prevValue } = useMemo(() => {
    let next = (globalValue + 1).toString().padStart(allwaysShowDigits, "0");
    let prev = (globalValue - 1).toString().padStart(allwaysShowDigits, "0");

    if (range.max !== null && globalValue + 1 > range.max) {
      next = "-".padStart(allwaysShowDigits, "-");
    } else if (hasNext.active && globalValue + 1 > hasNext.loopMax) {
      next = (range.min ?? 0).toString().padStart(allwaysShowDigits, "0");
    }

    if (
      (range.min !== null && globalValue - 1 < range.min) ||
      (!hasNext.active && globalValue - 1 < 0)
    ) {
      prev = "-".padStart(allwaysShowDigits, "-");
    } else if (hasNext.active && globalValue - 1 < 0) {
      prev = (range.max ?? hasNext.loopMax)
        .toString()
        .padStart(allwaysShowDigits, "0");
    }

    return { nextValue: next, prevValue: prev };
  }, [globalValue, allwaysShowDigits, range, hasNext]);

  const sendOnSteps = useCallback(
    function sendOnSteps(delta: number) {
      if (delta === 0) return;
      onChange?.({ type: "STEPS", segment, value: delta, id });
    },
    [onChange, id, segment]
  );

  const sendOnStepsRef = useRef(sendOnSteps);

  // Keep ref updated
  useEffect(() => {
    sendOnStepsRef.current = sendOnSteps;
  }, [sendOnSteps]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const PIXELS_PER_STEP = 20;

    let lastY: number | null = null;
    let accumulated = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      lastY = y;
      accumulated = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (lastY === null) return;
      e.preventDefault();
      e.stopPropagation();

      const y = e.touches[0].clientY;
      const dy = y - lastY;
      if (Math.abs(dy) < 2) {
        lastY = y;
        return;
      }
      accumulated += dy;
      const rawSteps = accumulated / PIXELS_PER_STEP;
      const stepsCount =
        rawSteps > 0 ? Math.floor(rawSteps) : Math.ceil(rawSteps);
      if (stepsCount !== 0) {
        const goingDown = stepsCount > 0;
        const singleStepDelta = goingDown ? 1 : -1;

        setDirectionAnimation(goingDown ? -1 : 1);
        for (let i = 0; i < Math.abs(stepsCount); i++) {
          sendOnStepsRef.current(singleStepDelta);
        }

        accumulated -= stepsCount * PIXELS_PER_STEP;
      }
      lastY = y;
    };

    const handleTouchEnd = () => {
      lastY = null;
      accumulated = 0;
    };
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = e.deltaY > 0;
      const delta = direction ? -1 : 1;
      setDirectionAnimation(direction ? 1 : -1);
      sendOnStepsRef.current(delta);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    console.log("eventListerenr runned");
    return () => {
      console.log("eventListerenr cleaned");
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleFocus = useCallback(
    function handleFocus() {
      typedCount.current = 0;
      onFocus(id);
    },
    [onFocus, id]
  );

  function handleDelete() {
    const min = range.min ?? 0;
    if (globalValue === min) {
      //GOES TO previous number.
      return onChange?.({
        type: "NUMBERS",
        segment,
        value: globalValue,
        id,
        goNext: [true, false],
      });
    }
    const newDigit = Math.floor(globalValue / 10);
    const clampedNumber = Math.max(range?.min ?? 0, newDigit);

    return onChange?.({
      type: "NUMBERS",
      segment,
      value: clampedNumber,
      id,
      goNext: [false, false],
    });
  }

  function handleDigit(newDigit: string) {
    const comparationType = range.max ?? hasNext.loopMax;
    const lengthNumber = comparationType.toString().length;
    if (typedCount.current >= lengthNumber) {
      typedCount.current = 0;
    }
    ++typedCount.current;
    const numberWhileFocus = (globalValue.toString() + newDigit).slice(
      -typedCount.current
    );

    let currentNumberCheck = Number(numberWhileFocus.padEnd(lengthNumber, "0"));
    const updatedNumber = Number(numberWhileFocus.padStart(lengthNumber, "0"));

    const clampedNumber = Math.max(
      range.min ?? 0,
      Math.min(updatedNumber, comparationType)
    );

    let goNextOrNo =
      currentNumberCheck > comparationType || updatedNumber !== clampedNumber;

    onChange?.({
      type: "NUMBERS",
      segment,
      value: clampedNumber,
      id,
      goNext: [goNextOrNo, true],
    });
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setDirectionAnimation(-1);
      sendOnStepsRef.current(1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setDirectionAnimation(1);
      sendOnStepsRef.current(-1);
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      handleDigit(e.key);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      handleDelete();
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      inputRef.current?.blur();
      // TODO: Make the tab, actually go from last to first number
      onChange?.({
        type: "NUMBERS",
        segment,
        value: globalValue,
        id,
        goNext: [true, true],
      });
    }
  }

  return (
    <div className="relative group flex items-end  text-6xl xs:text-7xl sm:text-8xl md:text-8xl lg:text-7xl xl:text-8xl  border border-transparent md:rounded-none rounded-sm max-md:focus-within:bg-[linear-gradient(to_bottom,transparent_0%,var(--color-main-600)_50%,transparent_100%)] hover:bg-stroke-500/40 md:focus-within:bg-stroke-500/70! overflow-hidden px-2 md:py-3 py-14">
      {globalValue
        .toString()
        .padStart(allwaysShowDigits, "0")
        .split("")
        .map((digit, i) => (
          <div key={i} className="relative  flex-1 h-full">
            <div className="md:opacity-0 duration-250 group-hover:opacity-100 group-focus-within:opacity-100!">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={digit}
                  custom={directionAnimation}
                  variants={{
                    enter: (custom: number) => ({
                      y: `${100 * custom}%`,
                      opacity: 0,
                    }),
                    center: { y: 0, opacity: 1 },
                    exit: (custom: number) => ({
                      y: `${-100 * custom}%`,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className=" absolute mx-auto left-0 right-0 md:top-2.5 top-0 -translate-y-full flex items-center text-stroke-400/10 mask-fade-up justify-center"
                  style={
                    {
                      "--fade-color": "var(--color-stroke-400)",
                      "--fade-stop": "100%",
                    } as React.CSSProperties
                  }
                >
                  {nextValue[i]}
                </motion.span>
              </AnimatePresence>
            </div>

            <span className="opacity-0">0</span>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={digit}
                custom={directionAnimation}
                variants={{
                  enter: (custom: number) => ({
                    y: `${100 * custom}%`,
                    opacity: 0,
                  }),
                  center: { y: 0, opacity: 1 },
                  exit: (custom: number) => ({
                    y: `${-100 * custom}%`,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 flex items-center justify-center text-current"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
            <div className="md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100!">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={digit}
                  custom={directionAnimation}
                  variants={{
                    enter: (custom: number) => ({
                      y: `${100 * custom}%`,
                      opacity: 0,
                    }),
                    center: { y: 0, opacity: 1 },
                    exit: (custom: number) => ({
                      y: `${-100 * custom}%`,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute mx-auto left-0 right-0 md:bottom-2.5 bottom-0 translate-y-full flex items-center  text-stroke-400/10 mask-fade-down justify-center"
                  style={
                    {
                      "--fade-color": "var(--color-stroke-400)",
                      "--fade-stop": "100%",
                    } as React.CSSProperties
                  }
                >
                  {prevValue[i]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        ))}
      {dots && (
        <span className="font-inter group-focus-within:text-fg text-stroke-400/80 text-base sm:text-xl    lg:text-lg   xl:text-xl     mb-1 sm:mb-2 lg:mb-1 xl:mb-2 ml-0.5">
          {segment}
        </span>
      )}
      <input
        id={segment}
        ref={inputRef}
        type="text"
        onKeyDown={handleKey}
        value={globalValue}
        inputMode="numeric"
        pattern="[0-9]*"
        onFocus={handleFocus}
        onChange={() => {}}
        aria-label={`${segment} numeric input`}
        className="absolute inset-0 opacity-0 cursor-pointer z-10 focus:outline-none touch-none"
      />
    </div>
  );
}

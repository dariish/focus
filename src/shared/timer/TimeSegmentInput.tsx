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

    const PIXELS_PER_STEP = 30; // Slightly increased for smoother feel
    const VELOCITY_SAMPLES = 8; // Number of velocity samples to track
    const MIN_VELOCITY = 0.005; // Minimum velocity to continue momentum
    const FRICTION = 0.92; // Smooth deceleration - starts fast, slows gradually (8% loss per frame)
    const VELOCITY_MULTIPLIER = 0.5; // Good momentum transfer from swipe
    const MOMENTUM_STEP_DELAY_MIN = 15; // Very fast at peak velocity (spins quickly at start)
    const MOMENTUM_STEP_DELAY_MAX = 200; // Slower at the end (smooth slowdown)
    const MAX_MOMENTUM_STEPS = 30; // Maximum total steps during momentum (prevents excessive scrolling)
    const MAX_ACTIVE_SWIPE_STEPS = 5; // Cap active swiping to allow fast but controlled swipes
    const FRAME_RATE = 16.67; // Approximate 60fps in ms

    let lastY: number | null = null;
    let accumulated = 0;
    let velocityHistory: Array<{ velocity: number; time: number }> = [];
    let momentumAnimationId: number | null = null;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (momentumAnimationId !== null) {
        cancelAnimationFrame(momentumAnimationId);
        momentumAnimationId = null;
        isScrolling = false;
      }

      const y = e.touches[0].clientY;
      lastY = y;
      accumulated = 0;
      velocityHistory = [];
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (lastY === null) return;
      e.preventDefault();
      e.stopPropagation();

      const y = e.touches[0].clientY;
      const now = Date.now();
      const dy = y - lastY;

      const timeDelta =
        velocityHistory.length > 0
          ? now - velocityHistory[velocityHistory.length - 1].time
          : FRAME_RATE;

      if (timeDelta > 0 && Math.abs(dy) > 0) {
        const velocity = dy / timeDelta;
        velocityHistory.push({ velocity, time: now });

        if (velocityHistory.length > VELOCITY_SAMPLES) {
          velocityHistory.shift();
        }
      }

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

        const cappedSteps = Math.min(
          Math.abs(stepsCount),
          MAX_ACTIVE_SWIPE_STEPS
        );

        setDirectionAnimation(goingDown ? -1 : 1);
        for (let i = 0; i < cappedSteps; i++) {
          sendOnStepsRef.current(singleStepDelta);
        }

        accumulated -= cappedSteps * PIXELS_PER_STEP * Math.sign(stepsCount);
      }
      lastY = y;
      isScrolling = true;
    };

    const handleTouchEnd = () => {
      if (lastY === null || !isScrolling) {
        lastY = null;
        accumulated = 0;
        return;
      }

      if (velocityHistory.length === 0) {
        lastY = null;
        accumulated = 0;
        return;
      }

      let totalVelocity = 0;
      let totalWeight = 0;
      const now = Date.now();

      velocityHistory.forEach((sample) => {
        const age = now - sample.time;
        const weight = Math.max(0, 1 - age / 200);
        totalVelocity += sample.velocity * weight;
        totalWeight += weight;
      });

      const averageVelocity = totalWeight > 0 ? totalVelocity / totalWeight : 0;
      const stepsPerFrame =
        ((averageVelocity * FRAME_RATE) / PIXELS_PER_STEP) *
        VELOCITY_MULTIPLIER;

      if (Math.abs(stepsPerFrame) > MIN_VELOCITY) {
        let currentVelocity = stepsPerFrame;
        let velocityAccumulator = 0;
        let lastStepTime = Date.now();
        let initialVelocity = Math.abs(stepsPerFrame);
        let totalMomentumSteps = 0;

        const momentumStep = () => {
          const now = Date.now();
          const timeSinceLastStep = now - lastStepTime;

          if (totalMomentumSteps >= MAX_MOMENTUM_STEPS) {
            momentumAnimationId = null;
            isScrolling = false;
            return;
          }

          const velocityRatio =
            Math.abs(currentVelocity) / Math.max(initialVelocity, 0.01);

          const adaptiveDelay =
            MOMENTUM_STEP_DELAY_MIN +
            (MOMENTUM_STEP_DELAY_MAX - MOMENTUM_STEP_DELAY_MIN) *
              (1 - velocityRatio);

          currentVelocity *= FRICTION;
          velocityAccumulator += currentVelocity;

          const steps =
            Math.abs(velocityAccumulator) >= 1
              ? Math.floor(Math.abs(velocityAccumulator)) *
                Math.sign(velocityAccumulator)
              : 0;

          const shouldExecute =
            steps !== 0 &&
            (timeSinceLastStep >= adaptiveDelay ||
              Math.abs(velocityAccumulator) >= 2.5);

          if (shouldExecute) {
            const goingDown = steps > 0;
            setDirectionAnimation(goingDown ? -1 : 1);

            const remainingSteps = MAX_MOMENTUM_STEPS - totalMomentumSteps;
            const stepsToExecute = Math.min(Math.abs(steps), 1, remainingSteps);

            if (stepsToExecute > 0) {
              for (let i = 0; i < stepsToExecute; i++) {
                sendOnStepsRef.current(goingDown ? 1 : -1);
                totalMomentumSteps++;
              }

              velocityAccumulator -= stepsToExecute * (goingDown ? 1 : -1);
              lastStepTime = now;
            }
          }

          const hasPendingVelocity = Math.abs(velocityAccumulator) >= 0.5;
          const shouldContinue =
            (Math.abs(currentVelocity) > MIN_VELOCITY || hasPendingVelocity) &&
            totalMomentumSteps < MAX_MOMENTUM_STEPS;

          if (shouldContinue) {
            momentumAnimationId = requestAnimationFrame(momentumStep);
          } else {
            momentumAnimationId = null;
            isScrolling = false;
          }
        };

        momentumAnimationId = requestAnimationFrame(momentumStep);
      }

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
      if (momentumAnimationId !== null) {
        cancelAnimationFrame(momentumAnimationId);
        momentumAnimationId = null;
      }
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

  const displayValue = globalValue.toString().padStart(allwaysShowDigits, "0");

  return (
    <div className="relative group flex items-end  text-7xl xs:text-8xl sm:text-8xl border border-transparent md:rounded-none rounded-sm max-md:focus-within:bg-[linear-gradient(to_bottom,transparent_0%,var(--color-main-600)_50%,transparent_100%)] hover:bg-stroke-500/40 md:focus-within:bg-stroke-500/70! overflow-hidden px-6 md:py-6 xs:py-20 py-16">
      <div className="relative flex-1 h-full">
        {/* Next value above (top) */}
        <div className="md:opacity-0 duration-250 group-hover:opacity-100 group-focus-within:opacity-100!">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={`next-${globalValue}`}
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
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute mx-auto left-0 right-0 md:top-2.5 top-0 -translate-y-full flex items-center text-stroke-400/10 mask-fade-up justify-center"
              style={
                {
                  "--fade-color": "var(--color-stroke-400)",
                  "--fade-stop": "100%",
                } as React.CSSProperties
              }
            >
              {nextValue}
            </motion.span>
          </AnimatePresence>
        </div>

        <span className="opacity-0">{"".padStart(allwaysShowDigits, "0")}</span>

        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={globalValue}
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
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 flex items-center justify-center text-current"
          >
            {displayValue}
          </motion.span>
        </AnimatePresence>

        {/* Previous value below (bottom) */}
        <div className="md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100!">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={`prev-${globalValue}`}
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
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute mx-auto left-0 right-0 md:bottom-2.5 bottom-0 translate-y-full flex items-center  text-stroke-400/10 mask-fade-down justify-center"
              style={
                {
                  "--fade-color": "var(--color-stroke-400)",
                  "--fade-stop": "100%",
                } as React.CSSProperties
              }
            >
              {prevValue}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
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

import { useState, useRef, useEffect } from "react";
import { FaPause, FaPlay, FaStop } from "react-icons/fa";
import { useTimePlayerStore } from "../../store/useTimePlayerStore";

export default function PlayerButtonsPopup() {
  const { pauseTimer, startTimer, isPaused, finishTimer } =
    useTimePlayerStore();
  const [stopProgress, setStopProgress] = useState(0);
  const [isHoldingStop, setIsHoldingStop] = useState(false);
  const stopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (stopIntervalRef.current) {
        clearInterval(stopIntervalRef.current);
      }
    };
  }, []);

  function handlePause() {
    if (isPaused) {
      startTimer();
    } else {
      pauseTimer();
    }
  }

  function handleStopClick() {
    finishTimer();
  }

  function handleStopMouseDown() {
    setIsHoldingStop(true);
    setStopProgress(0);
    stopStartTimeRef.current = Date.now();

    stopIntervalRef.current = setInterval(() => {
      if (stopStartTimeRef.current) {
        const elapsed = Date.now() - stopStartTimeRef.current;
        const elapsedSeconds = elapsed / 1000;

        // Progress bar completes smoothly at 1 second (100%)
        const visualProgress = Math.min((elapsedSeconds / 1.0) * 100, 100);
        setStopProgress(visualProgress);

        // Action triggers at 1.5 seconds
        if (elapsedSeconds >= 1.1) {
          handleStopClick();
          handleStopMouseUp();
        }
      }
    }, 30); // ~60fps
  }

  function handleStopMouseUp() {
    setIsHoldingStop(false);
    setStopProgress(0);
    stopStartTimeRef.current = null;
    if (stopIntervalRef.current) {
      clearInterval(stopIntervalRef.current);
      stopIntervalRef.current = null;
    }
  }

  const buttonClassName =
    "p-2.5 rounded-full border border-main-400 bg-gradient-to-tr hover:rotate-3 active:scale-90 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-stroke-500 hover:bg-gradient-to-tr hover:from-main-600/50 hover:to-main-300/10 group relative overflow-hidden";
  const absoluteClassName =
    "absolute inset-0 bg-gradient-to-r from-transparent via-main-800/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out";
  return (
    <div className="flex items-center gap-2">
      <button
        onMouseDown={handleStopMouseDown}
        onMouseUp={handleStopMouseUp}
        onMouseLeave={handleStopMouseUp}
        onTouchStart={handleStopMouseDown}
        onTouchEnd={handleStopMouseUp}
        className={`${buttonClassName} relative`}
      >
        <div className={absoluteClassName}></div>
        {/* Circular progress indicator */}
        {isHoldingStop && (
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${
                2 * Math.PI * 45 * (1 - stopProgress / 100)
              }`}
              className="text-red-400 transition-all duration-75"
              strokeLinecap="round"
            />
          </svg>
        )}
        <div className="relative z-10">
          <FaStop className="w-3 h-3 fill-current text-tertiary-500 group-active:text-red-400 transition-colors duration-300" />
        </div>
      </button>
      <button
        onClick={handlePause}
        className={`${buttonClassName} ${
          isPaused
            ? "border-stroke-500 from-contrast-600/5 to-main-300 hover:from-contrast-600/10! hover:to-main-300"
            : ""
        }`}
      >
        <div className={absoluteClassName}></div>
        <div className="relative z-10">
          {isPaused ? (
            <FaPlay className="w-4 h-4 fill-current text-contrast-500 transition-colors duration-300" />
          ) : (
            <FaPause className="w-4 h-4 fill-current text-tertiary-500 transition-colors duration-300" />
          )}
        </div>
      </button>
    </div>
  );
}

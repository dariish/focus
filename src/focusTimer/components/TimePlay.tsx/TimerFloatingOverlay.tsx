import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { useTimePlayerStore } from "../../store/useTimePlayerStore";
import { useTimerStore } from "../../store/useTimerStore";
import { useUIStore, type TimerFormat } from "../../store/useUIStore";
import PlayerButtonsPopup from "./PlayerButtonsPopup";
import { type SequenceItem, type SequenceType } from "./TimerContainer";
import {
  generateSequences,
  findCurrentSequenceIndex,
  getSequenceLabel,
} from "./TimerContainer";
import { FaTimes } from "react-icons/fa";

const FREE_MODE_LIMIT = 24 * 3600; // 24 hours in seconds

function formatTime(seconds: number, format: TimerFormat): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  switch (format) {
    case "h:m:s":
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    case "m:s":
      const totalMinutes = Math.floor(seconds / 60);
      return `${String(totalMinutes).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    case "h:m":
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    case "m":
      return String(Math.floor(seconds / 60));
    default:
      return String(Math.floor(seconds / 60));
  }
}

export default function TimerFloatingOverlay() {
  const hasBreaks = useTimerStore((s) => s.break);
  const mode = useTimerStore((s) => s.mode);
  const currentTime = useTimerStore((s) => s.currentTime);
  const activeTemplateId = useTimerStore((s) => s.activeTemplate);
  const templates = useTimerStore((s) => s.templates);
  const activeTimerFormat = useUIStore((s) => s.activeTimerFormat) || "m:s";
  const toggleWindow = useUIStore((s) => s.toggleWindow);

  const { isRunning, isPaused, accumulatedTime, lastStartedAt } =
    useTimePlayerStore();
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [position, setPosition] = useState({
    x: window.innerWidth - 320,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];

  const hasBreaksMode = hasBreaks;

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const runningDelta = isRunning && !isPaused ? now - lastStartedAt : 0;
      const newElapsed = accumulatedTime + runningDelta;
      setTotalElapsed(newElapsed);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [isRunning, isPaused, accumulatedTime, lastStartedAt]);

  // Calculate display time and sequences
  let displaySeconds = 0;
  let currentSequence: SequenceItem | null = null;

  if (hasBreaksMode) {
    const allSequences = generateSequences(activeTemplate, mode, currentTime);
    const absoluteCurrentIndex = findCurrentSequenceIndex(
      totalElapsed,
      allSequences
    );
    currentSequence = allSequences[absoluteCurrentIndex];

    if (currentSequence) {
      const elapsedInSequence = totalElapsed - currentSequence.startTime;
      displaySeconds = Math.max(
        0,
        currentSequence.duration - elapsedInSequence
      );
    } else {
      displaySeconds = 0;
    }
  } else {
    if (mode) {
      displaySeconds = Math.max(0, FREE_MODE_LIMIT - totalElapsed);
    } else {
      displaySeconds = Math.max(0, currentTime - totalElapsed);
    }
  }

  const currentSequenceType: SequenceType | null = currentSequence
    ? currentSequence.type
    : hasBreaksMode
    ? null
    : "focus";

  const formattedTime = formatTime(displaySeconds, activeTimerFormat);
  const sequenceLabel = currentSequenceType
    ? getSequenceLabel(currentSequenceType)
    : "";

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      className="bg-main-500 border border-main-400 rounded-lg shadow-2xl px-4 py-3 flex flex-row items-center gap-4"
      onMouseDown={handleMouseDown}
    >
      {/* Close button */}
      <button
        onClick={toggleWindow}
        className="text-tertiary-400 hover:text-tertiary-500 transition-colors p-1 shrink-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <FaTimes className="w-3 h-3" />
      </button>

      {/* Timer display */}
      <div className="flex flex-col items-start min-w-0">
        <div className="text-2xl font-bold font-archivo tabular-nums text-tertiary-500">
          {formattedTime}
        </div>
        {sequenceLabel && (
          <div className="text-xs text-contrast-500 font-light">
            {sequenceLabel}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="shrink-0">
        <PlayerButtonsPopup />
      </div>
    </motion.div>
  );
}

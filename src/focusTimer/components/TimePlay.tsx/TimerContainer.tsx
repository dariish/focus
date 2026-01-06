import { useEffect, useState } from "react";
import { useTimePlayerStore } from "../../store/useTimePlayerStore";
import { useTimerStore, type Template } from "../../store/useTimerStore";
import SequenceAlternator from "./SequenceAlternator";
import TimerInner from "./TimerInner";
import AllSequencesDisplay from "./AllSequencesDisplay";

type SequenceType = "focus" | "smallBreak" | "bigBreak";

export type SequenceItem = {
  type: SequenceType;
  duration: number;
  startTime: number; // Total elapsed time when this sequence starts
};

// Constants
const FREE_MODE_LIMIT = 24 * 3600; // 24 hours in seconds

// Shared utility functions
export const formatTime = (seconds: number): { hours: number; min: number } => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  return { hours, min: mins };
};

export const getSequenceLabel = (type: SequenceType): string => {
  switch (type) {
    case "focus":
      return "Focus";
    case "smallBreak":
      return "Break";
    case "bigBreak":
      return "Long Break";
  }
};

export const getSequenceIcon = (type: SequenceType): string => {
  switch (type) {
    case "focus":
      return "🎯";
    case "smallBreak":
      return "☕";
    case "bigBreak":
      return "🌴";
  }
};

/**
 * Generates a list of sequences from a template
 */
function generateSequences(
  template: Template,
  isFreeMode: boolean,
  totalTimeLimit: number
): SequenceItem[] {
  const { focusTime, smallBreakTime, bigBreakTime, sequence } = template;
  const sequences: SequenceItem[] = [];
  let currentTime = 0;
  let focusCount = 0;

  // Free mode: 24 hours limit
  // Limited mode: use the provided totalTimeLimit
  const effectiveTimeLimit = isFreeMode ? FREE_MODE_LIMIT : totalTimeLimit;
  const maxSequences = isFreeMode ? 1000 : Infinity; // Generate up to 1000 sequences for free mode

  const addSequence = (type: SequenceType, duration: number): boolean => {
    // Only check time limit in limited mode
    if (!isFreeMode && currentTime + duration > effectiveTimeLimit) {
      // Adjust duration to fit remaining time
      const remainingTime = effectiveTimeLimit - currentTime;
      if (remainingTime > 0) {
        sequences.push({
          type,
          duration: remainingTime,
          startTime: currentTime,
        });
        currentTime += remainingTime;
        return false; // Indicates we've hit the limit
      }
      return false;
    }

    sequences.push({ type, duration, startTime: currentTime });
    currentTime += duration;
    return true;
  };

  // If sequence = 0, pattern is just: Focus → Small Break → repeat
  if (sequence === 0) {
    while (sequences.length < maxSequences) {
      const focusAdded = addSequence("focus", focusTime);
      if (!focusAdded) break; // Hit limit during focus (only in limited mode)

      const breakAdded = addSequence("smallBreak", smallBreakTime);
      if (!breakAdded) break; // Hit limit during break (only in limited mode)
    }
    return sequences;
  }

  // sequence > 0: Focus → Small Break → ... (repeat sequence times) → Big Break → repeat
  while (sequences.length < maxSequences) {
    const focusAdded = addSequence("focus", focusTime);
    if (!focusAdded) break; // Hit limit during focus (only in limited mode)
    focusCount++;

    const isBigBreak = focusCount === sequence;
    const breakDuration = isBigBreak ? bigBreakTime : smallBreakTime;
    const breakType: SequenceType = isBigBreak ? "bigBreak" : "smallBreak";

    const breakAdded = addSequence(breakType, breakDuration);
    if (!breakAdded) break; // Hit limit during break (only in limited mode)

    if (isBigBreak) focusCount = 0;
  }

  return sequences;
}

/**
 * Finds the index of the current sequence based on total elapsed time
 */
function findCurrentSequenceIndex(
  totalElapsed: number,
  sequences: SequenceItem[]
): number {
  for (let i = 0; i < sequences.length; i++) {
    const seq = sequences[i];
    if (
      totalElapsed >= seq.startTime &&
      totalElapsed < seq.startTime + seq.duration
    ) {
      return i;
    }
  }
  // If we've passed all sequences, return the last one
  return Math.max(0, sequences.length - 1);
}

export default function TimerContainer() {
  const hasBreaks = useTimerStore((s) => s.break);
  const mode = useTimerStore((s) => s.mode);
  const currentTime = useTimerStore((s) => s.currentTime);
  const activeTemplateId = useTimerStore((s) => s.activeTemplate);
  const templates = useTimerStore((s) => s.templates);
  const {
    isRunning,
    isPaused,
    accumulatedTime,
    lastStartedAt,
    finishTimer,
    skipToTime,
  } = useTimePlayerStore();
  const [totalElapsed, setTotalElapsed] = useState(0);

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];

  const hasBreaksMode = hasBreaks;

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const runningDelta = isRunning && !isPaused ? now - lastStartedAt : 0;
      const newElapsed = accumulatedTime + runningDelta;
      setTotalElapsed(newElapsed);

      // Check if timer finished
      if (!mode && newElapsed >= currentTime) {
        // Limited mode: finish when reaching the set time limit
        finishTimer();
      } else if (mode && newElapsed >= FREE_MODE_LIMIT) {
        // Free mode: finish when reaching 24 hours
        finishTimer();
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [
    isRunning,
    isPaused,
    accumulatedTime,
    lastStartedAt,
    currentTime,
    mode,
    finishTimer,
  ]);

  // Calculate display time and sequences
  let displaySeconds = 0;
  let previousSequence: SequenceItem | null = null;
  let nextSequence: SequenceItem | null = null;
  let allSequencesForDisplay: SequenceItem[] = [];
  let absoluteCurrentIndex = -1;
  let currentSequence: SequenceItem | null = null;
  let currentSequenceProgress = 0;

  if (hasBreaksMode) {
    const allSequences = generateSequences(activeTemplate, mode, currentTime);
    absoluteCurrentIndex = findCurrentSequenceIndex(totalElapsed, allSequences);
    currentSequence = allSequences[absoluteCurrentIndex];

    // Calculate displaySeconds from the actual current sequence (accounts for adjusted durations)
    if (currentSequence) {
      const elapsedInSequence = totalElapsed - currentSequence.startTime;
      displaySeconds = Math.max(
        0,
        currentSequence.duration - elapsedInSequence
      );

      // Calculate progress for current sequence
      currentSequenceProgress = Math.min(
        100,
        (elapsedInSequence / currentSequence.duration) * 100
      );
    } else {
      displaySeconds = 0;
    }

    // For free mode, only show past sequences + current + 2 future sequences
    if (mode) {
      const endIndex = Math.min(allSequences.length, absoluteCurrentIndex + 3);
      allSequencesForDisplay = allSequences.slice(0, endIndex);
    } else {
      // Limited mode: show all sequences
      allSequencesForDisplay = allSequences;
    }

    if (absoluteCurrentIndex > 0) {
      previousSequence = allSequences[absoluteCurrentIndex - 1];
    }
    if (absoluteCurrentIndex < allSequences.length - 1) {
      nextSequence = allSequences[absoluteCurrentIndex + 1];
    }
  } else {
    // No breaks: count-up for free mode (capped at 24h), countdown for limited mode
    if (mode) {
      // Free mode: show elapsed time, but cap display at 24 hours
      displaySeconds = Math.min(totalElapsed, FREE_MODE_LIMIT);
      // Calculate progress based on 24-hour limit
      currentSequenceProgress = Math.min(
        100,
        (totalElapsed / FREE_MODE_LIMIT) * 100
      );
    } else {
      // Limited mode: countdown
      displaySeconds = Math.max(0, currentTime - totalElapsed);
      // Calculate progress for limited mode
      if (currentTime > 0) {
        currentSequenceProgress = Math.min(
          100,
          (totalElapsed / currentTime) * 100
        );
      }
    }
  }

  // Skip handler: skip to next sequence
  const handleSkipToNext = () => {
    if (!nextSequence || !currentSequence) return;

    const now = Math.floor(Date.now() / 1000);
    const currentAccumulated =
      isRunning && !isPaused
        ? accumulatedTime + (now - lastStartedAt)
        : accumulatedTime;

    if (mode) {
      // Free mode: just move to next sequence start time
      skipToTime(nextSequence.startTime);
    } else {
      // Limited mode: skip remaining time in current sequence
      // Calculate remaining time and add it to current accumulated time
      const elapsedInCurrentSequence =
        currentAccumulated - currentSequence.startTime;
      const remainingInCurrentSequence = Math.max(
        0,
        currentSequence.duration - elapsedInCurrentSequence
      );

      // Skip to next sequence by adding remaining time
      skipToTime(currentAccumulated + remainingInCurrentSequence);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center justify-center gap-8">
        {hasBreaksMode && previousSequence ? (
          <SequenceAlternator sequences={[previousSequence]} isPast={true} />
        ) : (
          <SequenceAlternator />
        )}
        <TimerInner
          seconds={displaySeconds}
          currentSequenceType={
            hasBreaksMode && currentSequence ? currentSequence.type : "focus"
          }
          progress={currentSequenceProgress}
        />
        {hasBreaksMode && nextSequence ? (
          <SequenceAlternator
            sequences={[nextSequence]}
            onSkip={handleSkipToNext}
          />
        ) : (
          <SequenceAlternator />
        )}
      </div>
      {hasBreaksMode && allSequencesForDisplay.length > 0 && (
        <AllSequencesDisplay
          sequences={allSequencesForDisplay}
          currentIndex={absoluteCurrentIndex}
        />
      )}
    </div>
  );
}

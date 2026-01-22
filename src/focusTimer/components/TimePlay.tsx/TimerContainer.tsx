import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTimePlayerStore } from "../../store/useTimePlayerStore";
import { useTimerStore, type Template } from "../../store/useTimerStore";
import SequenceAlternator from "./SequenceAlternator";
import TimerInner from "./TimerInner";
import AllSequencesDisplay from "./AllSequencesDisplay";
import { useUIStore, type TimerObject } from "../../store/useUIStore";
import PlayerButtons from "./PlayerButtons";
import TimerFull from "../../../assets/timer_filled.svg?react";
import notificationPing1 from "../../../assets/notification-ping-1.mp3";
import notificationPing2 from "../../../assets/notification-ping-2.mp3";
import notificationPing3 from "../../../assets/notification-ping-3.mp3";
import notificationPing4 from "../../../assets/notification-ping-4.mp3";
import TaskItemIsolated from "../tasks/TaskItemIsolated";

const soundMap: Record<string, string> = {
  "notification-ping-1.mp3": notificationPing1,
  "notification-ping-2.mp3": notificationPing2,
  "notification-ping-3.mp3": notificationPing3,
  "notification-ping-4.mp3": notificationPing4,
};

export type SequenceType = "focus" | "smallBreak" | "bigBreak";

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

function getTimerObject(
  object: TimerObject,
  objectFocus: boolean
): React.ReactElement | null {
  switch (object) {
    case "plant":
      return (
        <img
          src={objectFocus ? "/plant.png" : "/plant_pause.png"}
          alt="plant"
          className="w-full h-full object-contain"
        />
      );
    case "character":
      return (
        <img
          src={objectFocus ? "/character.png" : "/character_pause.png"}
          alt="character"
          className="w-full h-full object-contain"
        />
      );
    case "beer":
      return (
        <img
          src={objectFocus ? "/beer.png" : "/beer_pause.png"}
          alt="sand timer"
          className="w-full h-full object-contain"
        />
      );
    case "":
      return null;
    default:
      return null;
  }
}

/**
 * Generates a list of sequences from a template
 */
export function generateSequences(
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
export function findCurrentSequenceIndex(
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
  const activePlayerDesign = useUIStore((s) => s.activePlayerDesign);
  const showTimer = useUIStore((s) => s.showTimer);
  const activeTimerObject = useUIStore((s) => s.activeTimerObject);
  const showSequenceSkips = useUIStore((s) => s.showSequenceSkips);
  const showAllSequences = useUIStore((s) => s.showAllSequences);
  const activeSound = useUIStore((s) => s.activeSound);
  const showSound = useUIStore((s) => s.showSound);
  const showNotifications = useUIStore((s) => s.showNotifications);
  const notificationPermission = useUIStore((s) => s.notificationPermission);

  const {
    isRunning,
    isPaused,
    accumulatedTime,
    lastStartedAt,
    finishTimer,
    skipToTime,
    pauseTimer,
  } = useTimePlayerStore();
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState<{
    totalTime: number;
  } | null>(null);
  const isCompletedRef = useRef(false);
  const previousSequenceIndexRef = useRef<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const faviconAnimationIntervalRef = useRef<number | null>(null);
  const titleAnimationIntervalRef = useRef<number | null>(null);
  const originalFaviconRef = useRef<string>("/timer.svg");
  const previousSequenceIndexForTitleRef = useRef<number>(-1);

  const activeTemplate =
    templates.find((t) => t.id === activeTemplateId) || templates[0];

  const hasBreaksMode = hasBreaks;

  // Sync notification permission state
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      const updatePermission = () => {
        useUIStore.setState({
          notificationPermission: Notification.permission,
        });
      };
      // Update on mount
      updatePermission();
      // Note: There's no event listener for permission changes,
      // but we can check it when needed
    }
  }, []);

  // Initialize audio with activeSound
  useEffect(() => {
    const soundPath =
      soundMap[activeSound] || soundMap["notification-ping-1.mp3"];
    if (soundPath) {
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = 0.5; // Set volume to 50%
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [activeSound]);

  // Sync with popup window
  const popupWindow = useUIStore((s) => s.popupWindow);
  const startTimer = useTimePlayerStore((s) => s.startTimer);

  useEffect(() => {
    const update = () => {
      // Don't update if already completed
      if (isCompletedRef.current) return;

      const now = Math.floor(Date.now() / 1000);
      const runningDelta = isRunning && !isPaused ? now - lastStartedAt : 0;
      const newElapsed = accumulatedTime + runningDelta;
      setTotalElapsed(newElapsed);

      // Check if timer finished
      if (!mode && newElapsed >= currentTime && !isCompletedRef.current) {
        // Limited mode: finish when reaching the set time limit
        // Calculate stats before showing completion screen
        setSessionStats({
          totalTime: currentTime,
        });
        isCompletedRef.current = true;
        setIsCompleted(true);
      } else if (
        mode &&
        newElapsed >= FREE_MODE_LIMIT &&
        !isCompletedRef.current
      ) {
        // Free mode: finish when reaching 24 hours
        // Calculate stats before showing completion screen
        setSessionStats({
          totalTime: FREE_MODE_LIMIT,
        });
        isCompletedRef.current = true;
        setIsCompleted(true);
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

  // Send updates to popup window
  useEffect(() => {
    if (!popupWindow || popupWindow.closed) return;

    let sequenceLabel = "";
    if (hasBreaksMode && currentSequence) {
      sequenceLabel = getSequenceLabel(currentSequence.type);
    } else if (!hasBreaksMode) {
      sequenceLabel = "Focus";
    }

    try {
      popupWindow.postMessage(
        {
          type: "TIMER_UPDATE",
          data: {
            displaySeconds,
            sequenceLabel,
            isPaused,
            progress: currentSequenceProgress,
          },
        },
        "*"
      );
    } catch (e) {
      // Popup might be closed or cross-origin
    }
  }, [
    displaySeconds,
    isPaused,
    hasBreaksMode,
    currentSequence,
    popupWindow,
    currentSequenceProgress,
  ]);

  // Handle messages from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "TOGGLE_PAUSE") {
        if (isPaused) {
          startTimer();
        } else {
          pauseTimer();
        }
      } else if (event.data.type === "FINISH_TIMER") {
        finishTimer();
      } else if (event.data.type === "REQUEST_STATE") {
        // Send current state to popup - calculate here to ensure we have latest values
        if (popupWindow && !popupWindow.closed) {
          let seqLabel = "";
          let dispSeconds = 0;
          let progress = 0;

          if (hasBreaksMode) {
            const allSequences = generateSequences(
              activeTemplate,
              mode,
              currentTime
            );
            const absCurrentIndex = findCurrentSequenceIndex(
              totalElapsed,
              allSequences
            );
            const seq = allSequences[absCurrentIndex];
            if (seq) {
              seqLabel = getSequenceLabel(seq.type);
              const elapsedInSeq = totalElapsed - seq.startTime;
              dispSeconds = Math.max(0, seq.duration - elapsedInSeq);
              progress = Math.min(100, (elapsedInSeq / seq.duration) * 100);
            }
          } else {
            seqLabel = "Focus";
            if (mode) {
              dispSeconds = Math.min(totalElapsed, FREE_MODE_LIMIT);
              progress = Math.min(100, (totalElapsed / FREE_MODE_LIMIT) * 100);
            } else {
              dispSeconds = Math.max(0, currentTime - totalElapsed);
              if (currentTime > 0) {
                progress = Math.min(100, (totalElapsed / currentTime) * 100);
              }
            }
          }

          try {
            popupWindow.postMessage(
              {
                type: "TIMER_UPDATE",
                data: {
                  displaySeconds: dispSeconds,
                  sequenceLabel: seqLabel,
                  isPaused,
                  progress,
                },
              },
              "*"
            );
          } catch (e) {
            // Popup might be closed or cross-origin
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    isPaused,
    startTimer,
    pauseTimer,
    finishTimer,
    popupWindow,
    totalElapsed,
    hasBreaksMode,
    activeTemplate,
    mode,
    currentTime,
  ]);

  // Unified effect: Handle sound, notifications, title, and favicon when sequence changes or timer completes
  useEffect(() => {
    if (!isRunning && !isCompleted) return;

    // Determine if we should trigger notifications
    let shouldTrigger = false;
    let isSequenceChange = false;
    let sequenceType: SequenceType = "focus";
    let sequenceLabel = "Focus";

    // Check if timer completed
    if (isCompleted) {
      shouldTrigger = true;
      sequenceLabel = "Completed";
    }
    // Check if sequence changed (including first sequence when timer starts)
    else if (
      hasBreaksMode &&
      absoluteCurrentIndex !== -1 &&
      (previousSequenceIndexRef.current === -1 ||
        absoluteCurrentIndex !== previousSequenceIndexRef.current) &&
      isRunning &&
      currentSequence
    ) {
      shouldTrigger = true;
      isSequenceChange = true;
      sequenceType = currentSequence.type;
      sequenceLabel = getSequenceLabel(sequenceType);
    }

    // Only proceed if we should trigger
    if (!shouldTrigger) {
      // Update the previous index even if not triggering (to track state)
      if (hasBreaksMode && absoluteCurrentIndex !== -1) {
        previousSequenceIndexRef.current = absoluteCurrentIndex;
      }
      return;
    }

    // 1. Play sound if enabled
    if (showSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn("Could not play notification sound:", error);
      });
    }

    // 2. Show browser notification if enabled
    if (
      showNotifications &&
      typeof Notification !== "undefined" &&
      notificationPermission === "granted"
    ) {
      let notificationTitle = "";
      let notificationBody = "";

      if (isCompleted) {
        notificationTitle = "Session Completed!";
        notificationBody = "Great job! Your focus session has finished.";
      } else if (isSequenceChange) {
        notificationTitle = `${sequenceLabel} Time!`;
        notificationBody =
          sequenceType === "focus"
            ? "Time to focus and get things done!"
            : sequenceType === "bigBreak"
            ? "Take a well-deserved long break!"
            : "Take a quick break and recharge.";
      }

      if (notificationTitle) {
        try {
          const notification = new Notification(notificationTitle, {
            body: notificationBody,
            icon: "/timer.svg",
            badge: "/timer.svg",
            tag: "focus-timer-notification",
            requireInteraction: false,
          });

          // Auto-close notification after 5 seconds
          setTimeout(() => {
            notification.close();
          }, 5000);
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }
    }

    // 3. Update title and animate favicon
    if (isCompleted) {
      animateFavicon(10000);
      animateTitle("Completed", 10000);
    } else if (isSequenceChange) {
      animateFavicon(10000);
      animateTitle(sequenceLabel, 10000);
    }

    // Update the previous index
    if (hasBreaksMode && absoluteCurrentIndex !== -1) {
      previousSequenceIndexRef.current = absoluteCurrentIndex;
      previousSequenceIndexForTitleRef.current = absoluteCurrentIndex;
    }
  }, [
    absoluteCurrentIndex,
    currentSequence,
    hasBreaksMode,
    isRunning,
    isCompleted,
    showSound,
    showNotifications,
    notificationPermission,
  ]);

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

  // Handle completion screen "Ok" button
  const handleCompleteOk = () => {
    isCompletedRef.current = false;
    setIsCompleted(false);
    setSessionStats(null);
    finishTimer();
  };

  // Pause timer when completed
  useEffect(() => {
    if (isCompleted && isRunning && !isPaused) {
      pauseTimer();
    }
  }, [isCompleted, isRunning, isPaused, pauseTimer]);

  // Reset sequence index when timer stops
  useEffect(() => {
    if (!isRunning) {
      previousSequenceIndexRef.current = -1;
      previousSequenceIndexForTitleRef.current = -1;
    }
  }, [isRunning]);

  // Helper function to update favicon with rotation animation
  const animateFavicon = (duration: number = 10000) => {
    // Clear any existing animation
    if (faviconAnimationIntervalRef.current) {
      clearInterval(faviconAnimationIntervalRef.current);
    }

    const startTime = Date.now();
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create a simple timer icon SVG
    const drawTimerIcon = (rotation: number) => {
      ctx.clearRect(0, 0, 32, 32);
      ctx.save();
      ctx.translate(16, 16);
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw circle
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.strokeStyle = "#f8b863";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw hand (rotating)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -8);
      ctx.strokeStyle = "#f8b863";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    const updateFavicon = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        // Reset to original favicon
        const link = document.querySelector(
          "link[rel*='icon']"
        ) as HTMLLinkElement;
        if (link) {
          link.href = originalFaviconRef.current;
        }
        if (faviconAnimationIntervalRef.current) {
          clearInterval(faviconAnimationIntervalRef.current);
          faviconAnimationIntervalRef.current = null;
        }
        return;
      }

      // Rotate from 0 to 360 degrees, repeating
      const progress = (elapsed % 1000) / 1000; // 1 second rotation cycle
      const rotation = progress * 360;
      drawTimerIcon(rotation);

      // Update favicon
      const link = document.querySelector(
        "link[rel*='icon']"
      ) as HTMLLinkElement;
      if (link) {
        link.href = canvas.toDataURL();
      }
    };

    // Update every ~30ms for smooth animation
    faviconAnimationIntervalRef.current = window.setInterval(updateFavicon, 30);
    updateFavicon(); // Initial update
  };

  // Helper function to update title with animation
  const animateTitle = (sequenceLabel: string, duration: number = 10000) => {
    // Clear any existing animation
    if (titleAnimationIntervalRef.current) {
      clearInterval(titleAnimationIntervalRef.current);
    }

    const startTime = Date.now();
    const animationFrames = [
      `${sequenceLabel} •`,
      `${sequenceLabel} ••`,
      `${sequenceLabel} •••`,
      `${sequenceLabel} ••`,
      `${sequenceLabel} •`,
      sequenceLabel,
    ];

    const updateTitle = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        // Set final title
        document.title = sequenceLabel;
        if (titleAnimationIntervalRef.current) {
          clearInterval(titleAnimationIntervalRef.current);
          titleAnimationIntervalRef.current = null;
        }
        return;
      }

      // Animate title with pulsing dots
      const frameIndex = Math.floor((elapsed / 500) % animationFrames.length);
      document.title = animationFrames[frameIndex];
    };

    // Update every 500ms
    titleAnimationIntervalRef.current = window.setInterval(updateTitle, 500);
    updateTitle(); // Initial update
  };

  // Update title when running (normal state, not on sequence change)
  useEffect(() => {
    if (!isRunning) {
      document.title = "Focus Timer";
      previousSequenceIndexForTitleRef.current = -1;
      return;
    }

    if (isCompleted) {
      // Title animation is handled in the unified effect above
      return;
    }

    // Set normal title (without animation) for current sequence
    let sequenceType: SequenceType = "focus";
    if (hasBreaksMode && currentSequence) {
      sequenceType = currentSequence.type;
    }

    const sequenceLabel = getSequenceLabel(sequenceType);

    // Only update if we're not in the middle of an animation
    // Check if title animation is not running
    if (!titleAnimationIntervalRef.current) {
      document.title = sequenceLabel;
    }
  }, [
    absoluteCurrentIndex,
    currentSequence,
    hasBreaksMode,
    isRunning,
    isCompleted,
  ]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (faviconAnimationIntervalRef.current) {
        clearInterval(faviconAnimationIntervalRef.current);
        faviconAnimationIntervalRef.current = null;
      }
      if (titleAnimationIntervalRef.current) {
        clearInterval(titleAnimationIntervalRef.current);
        titleAnimationIntervalRef.current = null;
      }
    };
  }, []);

  // Format time for stats display
  const formatTimeForDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Show completion screen if session is completed
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col items-center justify-center cursor-default w-full gap-8 px-4 finish rounded-xl"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="bg-main-400 shadow-xl p-4 rounded-lg">
            <TimerFull className="w-16 h-16 text-contrast-600" />
          </div>
          <motion.h2
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.1,
            }}
            className="text-6xl xs:text-5xl text-center font-bold font-archivo bg-linear-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent"
            style={{
              filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))",
            }}
          >
            Session Completed
          </motion.h2>
          {sessionStats && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex flex-col gap-4">
                <div className="text-lg text-tertiary-500 font-semibold">
                  {formatTimeForDisplay(sessionStats.totalTime)}
                </div>
                {hasBreaksMode && (
                  <div className="flex items-center justify-center max-w-[358px]">
                    <AllSequencesDisplay
                      sequences={allSequencesForDisplay}
                      currentIndex={absoluteCurrentIndex + 1}
                      isFreeMode={mode}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={handleCompleteOk}
            className="mt-4 py-2 xs:px-10 px-6 rounded border border-stroke-500 ring-4 ring-stroke-600/10 bg-tertiary-500 transition-all duration-300 ease-out cursor-pointer active:border-main-500  active:ring-tertiary-500/70 active:ring-4 hover:ring-3 hover:ring-tertiary-500/50 hover:border-main-300 group relative overflow-hidden"
          >
            <span className=" text-main-500 font-black text-xl xs:text-2xl  transition-colors duration-300">
              Done
            </span>
          </button>
        </div>
      </motion.div>
    );
  }

  const sizes = "xs:h-[130px] h-[82px]";
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center  cursor-default w-full ${
        activePlayerDesign === "Default" ? "gap-10" : "gap-20"
      } `}
    >
      <div
        className={`flex flex-col ${
          showAllSequences ? "justify-around" : "justify-center"
        } items-center  ${sizes}`}
      >
        <TaskItemIsolated onPlayer={true} playerDesign={activePlayerDesign} />
        <div className="flex items-center">
          {hasBreaksMode &&
            showAllSequences &&
            allSequencesForDisplay.length > 0 && (
              <div
                className={`w-full max-w-[358px] flex items-center justify-center`}
              >
                <AllSequencesDisplay
                  sequences={allSequencesForDisplay}
                  currentIndex={absoluteCurrentIndex}
                  isFreeMode={mode}
                />
              </div>
            )}
        </div>
      </div>
      <div className="flex items-center md:justify-center xs:justify-around justify-center gap-4 sm:gap-8 w-full">
        <AnimatePresence mode="wait">
          {hasBreaksMode && showSequenceSkips && previousSequence ? (
            <motion.div
              key={`prev-${previousSequence.startTime}`}
              initial={{ opacity: 0, scale: 0.4, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.4, x: -40 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <SequenceAlternator
                sequence={previousSequence}
                isPast={true}
                activePlayerDesign={activePlayerDesign}
                showTimer={showTimer}
                activeTimerObjectElement={getTimerObject(
                  activeTimerObject,
                  (previousSequence ? previousSequence.type : "focus") ===
                    "focus"
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="prev-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SequenceAlternator
                activePlayerDesign={activePlayerDesign}
                showTimer={showTimer}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          key={`timer-${currentSequence?.startTime || 0}-${
            currentSequence?.type || "focus"
          }`}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`z-10`}
        >
          <TimerInner
            seconds={displaySeconds}
            currentSequenceType={
              hasBreaksMode && currentSequence ? currentSequence.type : "focus"
            }
            progress={currentSequenceProgress}
            activePlayerDesign={activePlayerDesign}
            showTimer={showTimer}
            activeTimerObjectElement={getTimerObject(
              activeTimerObject,
              (hasBreaksMode && currentSequence
                ? currentSequence.type
                : "focus") === "focus"
            )}
          />
        </motion.div>
        <AnimatePresence mode="wait">
          {hasBreaksMode && showSequenceSkips && nextSequence ? (
            <motion.div
              key={`next-${nextSequence.startTime}`}
              initial={{ opacity: 0, scale: 0.4, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.4, x: -80 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <SequenceAlternator
                sequence={nextSequence}
                onSkip={handleSkipToNext}
                activePlayerDesign={activePlayerDesign}
                showTimer={showTimer}
                activeTimerObjectElement={getTimerObject(
                  activeTimerObject,
                  (nextSequence ? nextSequence.type : "focus") === "focus"
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              key="next-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SequenceAlternator
                activePlayerDesign={activePlayerDesign}
                showTimer={showTimer}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className={` flex items-center ${sizes}`}>
        <PlayerButtons />
      </div>
    </div>
  );
}

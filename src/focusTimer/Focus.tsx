import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import FocusHeader from "./components/FocusHeader";
import TimerSection from "./components/TimeInputPage.tsx/TimerSection";
import TimePlay from "./components/TimePlay.tsx/TimePlay";
import TimeSideBar from "./components/sideBar/TimeSideBar";
import FocusToast from "./components/ui/FocusToast";
import TimerFloatingOverlay from "./components/TimePlay.tsx/TimerFloatingOverlay";
import { useTimePlayerStore } from "./store/useTimePlayerStore";
import { useUIStore } from "./store/useUIStore";

export default function Focus() {
  const theme = useUIStore((s) => s.theme);
  const isRunning = useTimePlayerStore((s) => s.isRunning);
  const openWindow = useUIStore((s) => s.openWindow);
  const useFloatingOverlay = useUIStore((s) => s.useFloatingOverlay);
  const [transitionKey, setTransitionKey] = useState(0);

  // Update key when isRunning changes to force AnimatePresence to detect the change
  useEffect(() => {
    setTransitionKey((prev) => prev + 1);
  }, [isRunning]);

  return (
    <div className="timer-widget focus" data-theme={theme.type}>
      <main className="bg-main-300 lg:flex">
        <section
          id="focus-left-section"
          className="relative w-full min-h-screen lg:min-h-[calc(100vh-82px)] flex flex-col lg:min-w-3/5 "
        >
          <div className="absolute top-0 left-0 right-0 w-full p-4 z-20">
            <FocusHeader onPlayer={isRunning} />
          </div>
          {isRunning ? (
            <motion.div
              key={`timeplay-${transitionKey}`}
              initial={{
                opacity: 0,
                y: 50,
                filter: "blur(10px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              className="flex-1 h-full flex flex-col items-center justify-center w-full gap-10 px-3 py-10"
            >
              <TimePlay />
            </motion.div>
          ) : (
            <motion.div
              key={`timersection-${transitionKey}`}
              initial={{
                opacity: 0,
                y: -50,
                filter: "blur(10px)",
              }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5 }}
              className="w-full flex-1 flex justify-center items-center xs:px-6 px-3 py-10"
            >
              <TimerSection />
            </motion.div>
          )}
        </section>

        <TimeSideBar />
      </main>
      <FocusToast />
      {/* Floating overlay (no browser chrome) */}
      <AnimatePresence>
        {openWindow && useFloatingOverlay && isRunning && (
          <TimerFloatingOverlay />
        )}
      </AnimatePresence>
    </div>
  );
}

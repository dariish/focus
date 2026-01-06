import FocusHeader from "./components/FocusHeader";
import TimerSection from "./components/TimeInputPage.tsx/TimerSection";
import TimePlay from "./components/TimePlay.tsx/TimePlay";
import TimeSideBar from "./components/sideBar/TimeSideBar";
import FocusToast from "./components/ui/FocusToast";
import { useTimePlayerStore } from "./store/useTimePlayerStore";
import { useUIStore } from "./store/useUIStore";

export default function Focus() {
  const theme = useUIStore((s) => s.theme);
  const isRunning = useTimePlayerStore((s) => s.isRunning);

  return (
    <div className="timer-widget focus" data-theme={theme.type}>
      <main className="bg-main-300 lg:flex">
        <section className="relative w-full min-h-[calc(100vh-82px)] flex flex-col lg:min-w-3/5 ">
          <div className="absolute top-0 left-0 right-0 w-full p-4">
            <FocusHeader />
          </div>
          {isRunning ? <TimePlay /> : <TimerSection />}
        </section>

        <TimeSideBar />
      </main>
      <FocusToast />
    </div>
  );
}

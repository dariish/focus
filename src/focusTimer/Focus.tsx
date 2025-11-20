import TimerSection from "./components/TimerSection";
import TimeSideBar from "./components/sideBar/TimeSideBar";

export default function Focus() {
  return (
    <div className="timer-widget" data-theme="dark">
      <main className="bg-main-500 lg:flex">
        <TimerSection />
        <TimeSideBar />
      </main>
    </div>
  );
}

import TimerSection from "./components/TimerSection";
import TimeSideBar from "./components/TimeSideBar";

export default function Focus() {
  return (
    <div className="timer-widget" data-theme="dark">
      <main className="bg-main-500 min-h-screen min-w-screen lg:flex">
        <TimerSection />
        <TimeSideBar />
      </main>
    </div>
  );
}

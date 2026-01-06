import TaskItemIsolated from "../tasks/TaskItemIsolated";
import PlayerButtons from "./PlayerButtons";
import TimerContainer from "./TimerContainer";

export default function TimePlay() {
  return (
    <div className="h-full flex flex-col items-center justify-center w-full gap-10 px-3 py-10">
      <TaskItemIsolated />
      <TimerContainer />
      <PlayerButtons />
    </div>
  );
}

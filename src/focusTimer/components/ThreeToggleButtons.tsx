import ToggleButtonFocusMode from "./ToggleButtonFocusMode";
import { PiBirdFill } from "react-icons/pi";
import { MdTimer, MdTimerOff } from "react-icons/md";
import { useTimerStore } from "../store/useTimerStore";

export default function ThreeToggleButtons() {
  //todo: the value that comes, might me dynamic, considering indexDB, or DB
  const mode = useTimerStore((s) => s.mode);
  const handleChangeMode = useTimerStore((s) => s.changeMode);

  return (
    <div className="flex gap-1 sm:gap-2">
      <div className="flex items-center justify-center border border-stroke-500 rounded-sm sm:p-1 bg-main-400">
        <ToggleButtonFocusMode
          onClick={() => handleChangeMode("free")}
          label="Free Mode"
          active={mode === "free"}
          icon={<PiBirdFill className="sm:w-5 sm:h-5 w-4 h-4" />}
        />
      </div>
      <div className="flex items-center border border-stroke-500 rounded-sm sm:p-1 gap-1 bg-main-400">
        <ToggleButtonFocusMode
          onClick={() => handleChangeMode("break")}
          label="breaks enabled"
          active={mode === "break"}
          icon={<MdTimerOff className="sm:w-5 sm:h-5 w-4 h-4" />}
        />
        <ToggleButtonFocusMode
          onClick={() => handleChangeMode("nobreak")}
          label="breaks disabled"
          active={mode === "nobreak"}
          icon={<MdTimer className="sm:w-5 sm:h-5 w-4 h-4" />}
        />
      </div>
    </div>
  );
}

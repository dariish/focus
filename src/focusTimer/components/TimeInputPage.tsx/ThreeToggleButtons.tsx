import { PiBirdFill } from "react-icons/pi";
import { MdTimer, MdTimerOff } from "react-icons/md";
import { useTimerStore } from "../../store/useTimerStore";
import SingleToggleButtonFromThree from "./SingleToggleButtonFromThree";

export default function ThreeToggleButtons() {
  //todo: the value that comes, might me dynamic, considering indexDB, or DB
  const mode = useTimerStore((s) => s.mode);
  const handleChangeMode = useTimerStore((s) => s.changeMode);

  return (
    <div className="flex gap-1 sm:gap-2">
      <div className="flex items-center justify-center border border-main-300 rounded-sm sm:p-0.5 ">
        <SingleToggleButtonFromThree
          onClick={() => handleChangeMode("free")}
          label="Free Mode"
          active={mode === "free"}
          icon={<PiBirdFill className="sm:w-5 sm:h-5 w-4 h-4" />}
        />
      </div>
      <div className="flex items-center border border-main-300 rounded-sm sm:p-0.5 gap-0.5 ">
        <SingleToggleButtonFromThree
          onClick={() => handleChangeMode("break")}
          label="breaks enabled"
          active={mode === "break"}
          icon={<MdTimerOff className="sm:w-5 sm:h-5 w-4 h-4" />}
        />
        <SingleToggleButtonFromThree
          onClick={() => handleChangeMode("nobreak")}
          label="breaks disabled"
          active={mode === "nobreak"}
          icon={<MdTimer className="sm:w-5 sm:h-5 w-4 h-4" />}
        />
      </div>
    </div>
  );
}

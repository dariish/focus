import { PiBirdFill } from "react-icons/pi";
import { MdTimer, MdTimerOff } from "react-icons/md";
import { useTimerStore } from "../../store/useTimerStore";
import SingleToggleButtonFromThree from "./SingleToggleButtonFromThree";

export default function ThreeToggleButtons() {
  //todo: the value that comes, might me dynamic, considering indexDB, or DB
  const mode = useTimerStore((s) => s.mode);
  const handleChangeMode = useTimerStore((s) => s.changeMode);
  const handleChangeBreak = useTimerStore((s) => s.changeBreak);
  const breaking = useTimerStore((s) => s.break);
  const classNameIcons = (val: boolean) =>
    `sm:w-5 sm:h-5 w-4 h-4  duration-200 ${
      val ? "" : " group-hover:fill-contrast-500"
    }`;

  return (
    <div className="flex gap-1 sm:gap-2">
      <div className="flex items-center border border-stroke-500 rounded-sm p-0.5 gap-0.5 ">
        <SingleToggleButtonFromThree
          onClick={() => handleChangeBreak()}
          label="Breaks"
          active={breaking}
          icon={<MdTimer className={classNameIcons(breaking)} />}
        />
        <SingleToggleButtonFromThree
          onClick={() => handleChangeBreak()}
          label="Continuous"
          active={!breaking}
          icon={<MdTimerOff className={classNameIcons(!breaking)} />}
        />
      </div>
      <div className="flex items-center justify-center border border-stroke-500 rounded-sm p-0.5 ">
        <SingleToggleButtonFromThree
          onClick={() => handleChangeMode()}
          label="Infinity"
          active={mode}
          icon={<PiBirdFill className={classNameIcons(mode)} />}
        />
      </div>
    </div>
  );
}

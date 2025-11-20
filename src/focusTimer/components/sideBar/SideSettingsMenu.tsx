import { MdTimerOff } from "react-icons/md";
import SettingsMenuItem from "./SettingsMenuItem";

export default function SideSettingsMenu() {
  return (
    <>
      <span>Settings</span>
      <menu className="py-3">
        <ul className="flex flex-col gap-3">
          <SettingsMenuItem
            icon={
              <MdTimerOff className="sm:w-6 sm:h-6 w-4 h-4 fill-stroke-700 group-hover:fill-tertiary-500 duration-250" />
            }
            title="Time Template"
            description="Time Modes, Customize your breaks"
          />
          <SettingsMenuItem
            icon={
              <MdTimerOff className="sm:w-6 sm:h-6 w-4 h-4 fill-stroke-700 group-hover:fill-tertiary-500 duration-250" />
            }
            title="Time Template"
            description="Time Modes, Customize your breaks"
          />
        </ul>
      </menu>
    </>
  );
}

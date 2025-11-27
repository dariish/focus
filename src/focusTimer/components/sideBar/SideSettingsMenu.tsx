import { MdTimerOff } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import type { SideSettingsPage } from "./SideSettings";
import BreadCrumb from "../../../shared/UI/BreadCrumb";

function SettingsMenuItem({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <li
      className="group flex bg-secondary-500/10 rounded shadow-sm p-3 cursor-pointer items-center gap-3 duration-250 hover:shadow-xl hover:bg-secondary-500/20 "
      onClick={onClick}
    >
      {icon}
      <div className="flex flex-col">
        <span className="">{title}</span>
        <span className="text-tertiary-400 leading-[0.9rem] text-sm font-light">
          {description}
        </span>
      </div>
      <IoIosArrowForward className="ml-auto fill-stroke-700 group-hover:fill-teriary-500 duration-250" />
    </li>
  );
}

export default function SideSettingsMenu({
  changePage,
}: {
  changePage: (page: SideSettingsPage) => void;
}) {
  return (
    <>
      <BreadCrumb items={[{ title: "Settings" }]} />
      <menu className="py-3">
        <ul className="flex flex-col gap-2">
          <SettingsMenuItem
            onClick={() => changePage("TimeTemplate")}
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

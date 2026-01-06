import { MdTimerOff, MdViewTimeline } from "react-icons/md";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { RiArrowRightLine } from "react-icons/ri";
import { useChangePage, PATHS } from "../../config/routes";

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
      className="group flex bg-main-650 border-y-2 border-stroke-500 rounded-sm shadow-sm p-3  items-center gap-4 duration-250 hover:shadow-xl hover:bg-main-700 cursor-default "
      onClick={onClick}
    >
      {icon}
      <div className="flex flex-col">
        <span className="">{title}</span>
        <span className="text-tertiary-400 leading-[0.9rem] text-xs font-light">
          {description}
        </span>
      </div>
      <RiArrowRightLine className="ml-auto fill-tertiary-500 group-hover:scale-110 duration-250" />
    </li>
  );
}

export default function SideSettingsMenu() {
  const changePage = useChangePage();
  return (
    <>
      <BreadCrumb
        className="py-2 border-y border-stroke-500/40 mb-10"
        items={[{ title: "Settings" }]}
      />
      <menu>
        <ul className="flex flex-col gap-2">
          <SettingsMenuItem
            onClick={() => changePage(PATHS.SIDEPAGE.SETTINGS.GENERAL)}
            icon={
              <MdTimerOff className="sm:w-5 sm:h-5 w-4 h-4 fill-tertirary-500" />
            }
            title="General Settings"
            description="Themes, toggles, and more"
          />
          <SettingsMenuItem
            onClick={() => changePage(PATHS.SIDEPAGE.SETTINGS.TIME_TEMPLATE)}
            icon={
              <MdViewTimeline className="sm:w-5 sm:h-5 w-4 h-4 fill-tertirary-500" />
            }
            title="Break Templates"
            description="Customize your breaks templates"
          />
        </ul>
      </menu>
    </>
  );
}

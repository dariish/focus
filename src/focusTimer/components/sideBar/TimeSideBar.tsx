import TwoWordsToggle from "../../../shared/toggles/TwoWordsToggle";
import { useUIStore } from "../../store/useUIStore";
import { RiSettings4Fill } from "react-icons/ri";
import { useState } from "react";
import SideSettings from "./SideSettings";
export type SidePage = "settings" | "tasks" | "stats";

export default function TimeSideBar() {
  const sideBarOpen = useUIStore((s) => s.openSideBar);
  const [sidePage, setSidePage] = useState<SidePage>("tasks");

  function changeSidePage(val: SidePage) {
    setSidePage(val);
  }
  return (
    <section
      className={`${
        sideBarOpen ? "lg:max-w-[590px]" : "lg:max-w-16"
      }  w-full h-screen bg-main-600 lg:border-l border-t lg:border-t-0 border-main-900 py-5 sm:px-6 overflow-hidden duration-450`}
    >
      <div className="flex justify-between">
        <TwoWordsToggle
          onChange={changeSidePage}
          firstLabel={"Tasks"}
          secondLabel={"Stats"}
        />
        <button
          onClick={() => changeSidePage("settings")}
          className="group cursor-pointer duration-300 bg-main-700 border-2 border-main-900 rounded-full p-3"
        >
          <RiSettings4Fill className="w-5 h-5 duration-300 group-hover:fill-secondary-700 group-hover:animate-spin" />
        </button>
      </div>
      <div className="pt-10">{sidePage === "settings" && <SideSettings />}</div>
    </section>
  );
}

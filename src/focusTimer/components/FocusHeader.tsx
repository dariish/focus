import { MdOutlineMenuOpen } from "react-icons/md";
import FocusHeaderBtn from "./FocusHeaderBtn";
import { useUIStore } from "../store/useUIStore";

export default function FocusHeader() {
  const toggleSideBar = useUIStore((s) => s.toggleSideBar);
  const openSideBar = useUIStore((s) => s.openSideBar);
  return (
    <menu className="h-full ">
      <ul className="flex items-center justify-end gap-2 h-full ">
        <FocusHeaderBtn
          onClick={toggleSideBar}
          className="lg:flex hidden"
          icon={
            <MdOutlineMenuOpen
              className={`${
                openSideBar ? "rotate-180 " : ""
              } duration-500 w-8 h-8 fill-stroke-700 group-hover:fill-tertiary-500`}
            />
          }
        />
      </ul>
    </menu>
  );
}

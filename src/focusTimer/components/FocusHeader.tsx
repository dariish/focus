import { MdOutlineMenuOpen } from "react-icons/md";
import FocusHeaderBtn from "./FocusHeaderBtn";
import { useUIStore } from "../store/useUIStore";
import { useNavigate } from "react-router-dom";
import { PATHS, useHasSidePageInUrl } from "../config/routes";
import { useRef, useEffect } from "react";

export default function FocusHeader() {
  const sideBarOpen = useUIStore((s) => s.openSideBar);
  const navigate = useNavigate();
  const lastSidePageRef = useRef<string | null>(null);

  const { hasSidePage, sidePage } = useHasSidePageInUrl();

  useEffect(() => {
    if (sidePage) {
      lastSidePageRef.current = sidePage;
    }
  }, [sidePage]);

  const handleToggle = () => {
    if (hasSidePage) {
      navigate("/", { replace: true });
    } else {
      const sidePageToUse =
        lastSidePageRef.current || PATHS.SIDEPAGE.TASKS.ROOT;
      navigate(`/${sidePageToUse}`, { replace: true });
    }
  };

  return (
    <menu className="h-full ">
      <ul className="flex items-center justify-end gap-2 h-full ">
        <FocusHeaderBtn
          onClick={handleToggle}
          className="lg:flex hidden"
          icon={
            <MdOutlineMenuOpen
              className={`${
                sideBarOpen ? "rotate-180 " : ""
              } duration-500 w-8 h-8 fill-tertiary-400  group-hover:fill-tertiary-500`}
            />
          }
        />
      </ul>
    </menu>
  );
}

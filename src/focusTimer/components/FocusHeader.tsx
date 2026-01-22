import {
  MdFullscreen,
  MdFullscreenExit,
  MdOutlineMenuOpen,
} from "react-icons/md";
import FocusHeaderBtn from "./FocusHeaderBtn";
import { useUIStore } from "../store/useUIStore";
import { useNavigate } from "react-router-dom";
import { PATHS, useHasSidePageInUrl } from "../config/routes";
import { useRef, useEffect, useState } from "react";
import { RxExternalLink } from "react-icons/rx";
import { useTimePlayerStore } from "../store/useTimePlayerStore";

export default function FocusHeader({ onPlayer }: { onPlayer: boolean }) {
  const sideBarOpen = useUIStore((s) => s.openSideBar);
  const navigate = useNavigate();
  const lastSidePageRef = useRef<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const openWindow = useUIStore((s) => s.openWindow);
  const toggleWindow = useUIStore((s) => s.toggleWindow);
  const popupWindow = useUIStore((s) => s.popupWindow);
  const setPopupWindow = useUIStore((s) => s.setPopupWindow);
  const isRunning = useTimePlayerStore((s) => s.isRunning);

  const { hasSidePage, sidePage } = useHasSidePageInUrl();

  useEffect(() => {
    if (sidePage) {
      lastSidePageRef.current = sidePage;
    }
  }, [sidePage]);

  // Close popup window when timer stops
  useEffect(() => {
    if (!isRunning && popupWindow && !popupWindow.closed) {
      popupWindow.close();
      setPopupWindow(null);
      useUIStore.setState({ openWindow: false });
    }
  }, [isRunning, popupWindow, setPopupWindow]);

  // Handle popup window close detection
  useEffect(() => {
    if (!popupWindow) return;

    const checkClosed = setInterval(() => {
      if (popupWindow.closed) {
        clearInterval(checkClosed);
        setPopupWindow(null);
        useUIStore.setState({ openWindow: false });
      }
    }, 500);

    return () => clearInterval(checkClosed);
  }, [popupWindow, setPopupWindow]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

  const handleToggle = () => {
    if (hasSidePage) {
      navigate("/", { replace: true });
    } else {
      const sidePageToUse =
        lastSidePageRef.current || PATHS.SIDEPAGE.TASKS.ROOT;
      navigate(`/${sidePageToUse}`, { replace: true });
    }
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        } else if ((document.documentElement as any).mozRequestFullScreen) {
          await (document.documentElement as any).mozRequestFullScreen();
        } else if ((document.documentElement as any).msRequestFullscreen) {
          await (document.documentElement as any).msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  return (
    <menu className="h-full">
      <ul className="flex items-center justify-end gap-2 h-full ">
        {onPlayer && isRunning && (
          <FocusHeaderBtn
            onClick={toggleWindow}
            className="lg:flex hidden"
            active={openWindow}
            icon={
              <RxExternalLink
                className={`duration-500 w-7 h-7 text-tertiary-400  group-hover:text-tertiary-500 ${
                  openWindow ? "text-contrast-600!" : ""
                }`}
              />
            }
          />
        )}
        <FocusHeaderBtn
          onClick={handleFullscreen}
          className="lg:flex hidden"
          icon={
            <div className={`duration-500 ${isFullscreen ? "rotate-180" : ""}`}>
              {isFullscreen ? (
                <MdFullscreenExit className="w-8 h-8 fill-tertiary-400  group-hover:fill-tertiary-500" />
              ) : (
                <MdFullscreen className="w-8 h-8 fill-tertiary-400  group-hover:fill-tertiary-500" />
              )}
            </div>
          }
        />
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

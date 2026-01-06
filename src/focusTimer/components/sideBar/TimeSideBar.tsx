import { useUIStore } from "../../store/useUIStore";
import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useNavigate } from "react-router-dom";
import SideSettings from "./SideSettings";
import SideHeader from "./SideHeader";
import SideTasks from "../tasks/SideTasks";
import { PATHS, useHasSidePageInUrl } from "../../config/routes";
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);

    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
};

export default function TimeSideBar() {
  const sideBarOpen = useUIStore((s) => s.openSideBar);
  const setSideBarOpen = useUIStore((s) => s.setSideBarOpen);
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const effectiveSideBarOpen = isDesktop ? sideBarOpen : true;
  const progress = useMotionValue(effectiveSideBarOpen ? 1 : 0);

  const { hasSidePage, sidePage } = useHasSidePageInUrl();

  useEffect(() => {
    if (!isDesktop) return;

    // If sidebar is closed and URL has sidePage (from external navigation), open it
    if (hasSidePage) {
      setSideBarOpen(true);
    } else {
      setSideBarOpen(false);
    }
  }, [isDesktop, hasSidePage, setSideBarOpen]);

  useEffect(() => {
    if (isDesktop) {
      const controls = animate(progress, sideBarOpen ? 1 : 0, {
        duration: 0.4,
        ease: "easeInOut",
      });
      return () => controls.stop();
    } else {
      progress.set(1);
    }
  }, [sideBarOpen, isDesktop, progress]);

  const maxWidth = useTransform(progress, [0, 1], ["64px", "590px"]);
  const blur = useTransform(
    progress,
    [0, 0.2, 0.8, 1],
    ["blur(0px)", "blur(4px)", "blur(4px)", "blur(0px)"]
  );
  const opacity = useTransform(progress, [0, 0.5, 1], [1, 0.7, 1]);
  const contentOpacity = useTransform(progress, [0.2, 1], [0, 1]);

  function changeSidePage(val: string) {
    const path = val.toLowerCase();
    navigate(`/${path}`);
  }

  return (
    <motion.section
      style={{
        maxWidth: isDesktop ? maxWidth : "100%",
      }}
      className={`focus-sidebar sticky  max-sm:px-2! max-lg:px-8! py-4 sm:py-8 lg:py-5 w-full top-0 lg:h-screen min-h-screen bg-main-450 lg:border-l border-t lg:border-t-0 border-stroke-500 overflow-y-auto ${
        sideBarOpen ? "px-4" : "px-2"
      }`}
    >
      <motion.div
        style={{
          filter: isDesktop ? blur : "blur(0px)",
          opacity: isDesktop ? opacity : 1,
        }}
      >
        <SideHeader
          onChange={changeSidePage}
          firstLabel={PATHS.SIDEPAGE.TASKS.ROOT}
          secondLabel={PATHS.SIDEPAGE.STATS.ROOT}
          activeLabel={sidePage}
          isOpen={effectiveSideBarOpen}
        />
      </motion.div>
      {effectiveSideBarOpen && (
        <motion.div
          style={{
            filter: isDesktop ? blur : "blur(0px)",
            opacity: isDesktop ? contentOpacity : 1,
          }}
          className="mt-5"
        >
          {sidePage === PATHS.SIDEPAGE.TASKS.ROOT && <SideTasks />}
          {sidePage === PATHS.SIDEPAGE.SETTINGS.ROOT && <SideSettings />}
          {sidePage === PATHS.SIDEPAGE.STATS.ROOT && <div>Ah?</div>}
        </motion.div>
      )}
    </motion.section>
  );
}

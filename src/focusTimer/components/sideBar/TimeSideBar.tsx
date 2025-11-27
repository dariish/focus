import { useUIStore } from "../../store/useUIStore";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import SideSettings from "./SideSettings";
import HeaderSidebar from "./HeaderSidebar";
export type SidePage = "Settings" | "Tasks" | "Stats";

// Media query hook for lg breakpoint (1024px)
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);

    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

export default function TimeSideBar() {
  const sideBarOpen = useUIStore((s) => s.openSideBar);
  const [sidePage, setSidePage] = useState<SidePage>("Tasks");
  const [isAnimating, setIsAnimating] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // On mobile, always treat sidebar as "open" (full width)
  const effectiveSideBarOpen = isDesktop ? sideBarOpen : true;

  function changeSidePage(val: SidePage) {
    setSidePage(val);
  }

  useEffect(() => {
    // Only animate on desktop
    if (!isDesktop) return;

    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [sideBarOpen, isDesktop]);

  return (
    <motion.section
      animate={
        isDesktop
          ? {
              maxWidth: effectiveSideBarOpen ? "590px" : "64px",
              paddingLeft: effectiveSideBarOpen ? "0.5rem" : "0.5rem",
              paddingRight: effectiveSideBarOpen ? "0.5rem" : "0.5rem",
            }
          : {
              maxWidth: "100%",
            }
      }
      transition={
        isDesktop
          ? {
              type: "tween",
              duration: 0.4,
              ease: "easeInOut",
            }
          : { duration: 0 }
      }
      className={`sticky max-sm:px-4! max-lg:px-10! w-full top-0 lg:h-screen min-h-screen  bg-main-600 lg:border-l border-t lg:border-t-0 border-main-900 py-5 overflow-y-auto`}
    >
      <motion.div
        animate={
          isDesktop
            ? {
                filter: isAnimating ? "blur(8px)" : "blur(0px)",
                opacity: isAnimating ? 0.7 : 1,
              }
            : {
                filter: "blur(0px)",
                opacity: 1,
              }
        }
        transition={
          isDesktop
            ? {
                type: "spring",
                stiffness: 300,
                damping: 30,
              }
            : { duration: 0 }
        }
      >
        <HeaderSidebar
          onChange={changeSidePage}
          firstLabel={"Tasks"}
          secondLabel={"Stats"}
          activeLabel={sidePage}
          isOpen={effectiveSideBarOpen}
        />
      </motion.div>
      {effectiveSideBarOpen && (
        <motion.div
          animate={
            isDesktop
              ? {
                  filter: isAnimating ? "blur(8px)" : "blur(0px)",
                  opacity: isAnimating ? 0.7 : 1,
                }
              : {
                  filter: "blur(0px)",
                  opacity: 1,
                }
          }
          transition={
            isDesktop
              ? {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }
              : { duration: 0 }
          }
          className="pt-10"
        >
          {sidePage === "Settings" && <SideSettings />}
        </motion.div>
      )}
    </motion.section>
  );
}

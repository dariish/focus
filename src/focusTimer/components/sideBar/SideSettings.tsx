import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { PATHS } from "../../config/routes";

export type SideSettingsPage =
  | "Menu"
  | "TimeTemplate"
  | "TimeVisual"
  | "GeneralSettings"
  | "Goals";

export default function SideSettings() {
  const navigate = useNavigate();
  const location = useLocation();

  function changePage(pagePath: string) {
    navigate(`/${PATHS.SIDEPAGE.SETTINGS.ROOT}/${pagePath}`);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{
          opacity: 0,
          x: location.pathname.includes("menu") ? -100 : 50,
          filter: "blur(10px)",
        }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{
          opacity: 0,
          x: location.pathname.includes("menu") ? -600 : 600,
          filter: "blur(10px)",
        }}
        transition={{ duration: 0.2 }}
      >
        <Outlet context={{ changePage }} />
      </motion.div>
    </AnimatePresence>
  );
}

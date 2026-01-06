import { useLocation, useOutletContext } from "react-router-dom";

export const PATHS = {
  SIDEPAGE: {
    SETTINGS: {
      ROOT: "settings",
      MENU: "menu",
      GENERAL: "general-settings",
      TIME_TEMPLATE: "time-template",
    },
    TASKS: {
      ROOT: "tasks",
    },
    STATS: {
      ROOT: "stats",
    },
  },

  ABSOLUTE: {
  TASKS: "/tasks",
  STATS: "/stats",
  SETTINGS: {
    ROOT: "/settings",
    MENU: "/settings/menu",
      GENERAL: "/settings/general-settings",
    TIME_TEMPLATE: "/settings/time-template",
  },
  },
};

export function useChangePage(): (pagePath: string) => void {
  const context = useOutletContext<{
    changePage?: (pagePath: string) => void;
  }>();
  const changePage = context?.changePage;

  if (!changePage) {
    throw new Error("changePage function not provided via outlet context");
  }

  return changePage;
}

export function useHasSidePageInUrl(): {
  hasSidePage: boolean;
  sidePage: string | null;
} {
  const location = useLocation();
  const pathname = location.pathname;

  let sidePage: string | null = null;
  if (pathname.includes(`/${PATHS.SIDEPAGE.SETTINGS.ROOT}`)) {
    sidePage = PATHS.SIDEPAGE.SETTINGS.ROOT;
  } else if (pathname.includes(`/${PATHS.SIDEPAGE.STATS.ROOT}`)) {
    sidePage = PATHS.SIDEPAGE.STATS.ROOT;
  } else if (pathname.includes(`/${PATHS.SIDEPAGE.TASKS.ROOT}`)) {
    sidePage = PATHS.SIDEPAGE.TASKS.ROOT;
  }

  return {
    hasSidePage: sidePage !== null,
    sidePage,
  };
}

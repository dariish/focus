import { useState } from "react";
import SideSettingsMenu from "./SideSettingsMenu";
import SideSettingsTimeTemplate from "./SideSettingsTimeTemplate";

export type SideSettingsPage =
  | "Menu"
  | "TimeTemplate"
  | "TimeVisual"
  | "General"
  | "Goals";
export default function SideSettings() {
  const [page, setPage] = useState<SideSettingsPage>("Menu");

  function changePage(page: SideSettingsPage) {
    setPage(page);
  }
  return (
    <div>
      {page === "Menu" && <SideSettingsMenu changePage={changePage} />}
      {page === "TimeTemplate" && (
        <SideSettingsTimeTemplate changePage={changePage} />
      )}
    </div>
  );
}

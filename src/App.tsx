import "./App.css";
import { Routes, Route } from "react-router-dom";
import Focus from "./focusTimer/Focus";
import SideTasks from "./focusTimer/components/tasks/SideTasks";
import SideSettings from "./focusTimer/components/sideBar/SideSettings";
import SideSettingsMenu from "./focusTimer/components/sideBar/SideSettingsMenu";
import SideGeneral from "./focusTimer/components/sideBar/SideGeneral";
import SideSettingsTimeTemplate from "./focusTimer/components/sideBar/SideSettingsTimeTemplate";
import { PATHS } from "./focusTimer/config/routes";
import SideTimeUI from "./focusTimer/components/sideBar/SideTimeUI";
import SideNotifications from "./focusTimer/components/sideBar/SideNotifications";
import Stats from "./focusTimer/components/stats/Stats";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Focus />}>
        <Route index element={<SideTasks />} />
        <Route path={PATHS.SIDEPAGE.TASKS.ROOT} element={<SideTasks />} />
        <Route path={PATHS.SIDEPAGE.STATS.ROOT} element={<Stats />} />
        <Route path={PATHS.SIDEPAGE.SETTINGS.ROOT} element={<SideSettings />}>
          <Route index element={<SideSettingsMenu />} />
          <Route
            path={PATHS.SIDEPAGE.SETTINGS.MENU}
            element={<SideSettingsMenu />}
          />
          <Route
            path={PATHS.SIDEPAGE.SETTINGS.GENERAL}
            element={<SideGeneral />}
          />
          <Route
            path={PATHS.SIDEPAGE.SETTINGS.TIME_TEMPLATE}
            element={<SideSettingsTimeTemplate />}
          />
          <Route
            path={PATHS.SIDEPAGE.SETTINGS.TIME_UI}
            element={<SideTimeUI />}
          />
          <Route
            path={PATHS.SIDEPAGE.SETTINGS.NOTIFICATIONS}
            element={<SideNotifications />}
          />
        </Route>
      </Route>

      {/* 2. INDEPENDENT PAGES (No Sidebar) */}
      <Route path="/account" element={<div>Account Page protected</div>} />
      <Route path="/login" element={<div>Login Page</div>} />
    </Routes>
  );
}

export default App;

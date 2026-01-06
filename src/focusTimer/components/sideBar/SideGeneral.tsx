import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { IoIosArrowForward } from "react-icons/io";
import { useUIStore, type SideTheme } from "../../store/useUIStore";
import { FaCheck } from "react-icons/fa";
import SideSectionHeader from "../ui/SideSectionHeader";
import SideSectionMid from "../ui/SideSectionMid";
import { useChangePage, PATHS } from "../../config/routes";

export default function SideGeneral() {
  const changePage = useChangePage();
  const allThemes = useUIStore((s) => s.allThemes);
  const currentTheme = useUIStore((s) => s.theme);
  const changeThemeStore = useUIStore((s) => s.changeTheme);
  function changeTheme(theme: SideTheme) {
    changeThemeStore(theme);
  }
  return (
    <section>
      <BreadCrumb
        className="py-1 border-y border-stroke-500/40 mb-10"
        activeItemClassName="text-tertiary-500"
        itemClassName="text-tertiary-400 hover:text-tertiary-500 duration-250"
        items={[
          {
            title: "Settings",
            onClick: () => changePage(PATHS.SIDEPAGE.SETTINGS.MENU),
          },
          { title: "General" },
        ]}
        showBackButton={true}
        backButtonClassName="border border-stroke-500/60 bg-main-600 hover:bg-main-650 duration-250 h-full p-1.5"
        onBack={() => changePage(PATHS.SIDEPAGE.SETTINGS.MENU)}
        separator={<IoIosArrowForward className="fill-stroke-600 w-3 " />}
      />

      <SideSectionHeader
        title="Choose Themes"
        content={
          <div className="flex items-center gap-2 text-tertiary-400 text-sm font-light">
            <div
              className="w-5 h-5 rounded-full shadow-inner"
              style={{
                background: `linear-gradient(90deg, 
                        ${currentTheme.colors[0]} 0%, 
                        ${currentTheme.colors[0]} 33.3%, 
                        ${currentTheme.colors[1]} 33.3%, 
                        ${currentTheme.colors[1]} 66.6%, 
                        ${currentTheme.colors[2]} 66.6%, 
                        ${currentTheme.colors[2]} 100%
                    )`,
              }}
            ></div>
            <span className="text-tertiary-500">{currentTheme.type}</span>
          </div>
        }
      >
        <SideSectionMid
          containerClassName="grid grid-cols-3 gap-2 p-2"
          bottomBorder={true}
        >
          {allThemes.map((theme, index) => (
            <div
              onClick={() => changeTheme(theme.type)}
              key={index}
              className={`flex items-center gap-3 border relative bg-main-650 border-stroke-500  duration-250 cursor-pointer rounded-sm p-2 shadow-sm ${
                theme === currentTheme
                  ? "bg-main-750 border-secondary-500!"
                  : "hover:border-secondary-500/50!"
              }`}
            >
              {theme === currentTheme && (
                <div className="absolute top-1 right-1 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-secondary-500 rounded-full flex items-center justify-center">
                  <FaCheck fill="white" className="w-2 h-2" />
                </div>
              )}
              <div
                className="w-8 h-8 rounded-lg shadow-inner border border-stroke-500"
                style={{
                  background: `linear-gradient(90deg, 
                          ${theme.colors[0]} 0%, 
                          ${theme.colors[0]} 33.3%, 
                          ${theme.colors[1]} 33.3%, 
                          ${theme.colors[1]} 66.6%, 
                          ${theme.colors[2]} 66.6%, 
                          ${theme.colors[2]} 100%
                        )`,
                }}
              ></div>
              <span className="text-tertiary-500">{theme.type}</span>
            </div>
          ))}
        </SideSectionMid>
      </SideSectionHeader>
    </section>
  );
}

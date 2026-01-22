import { useMemo } from "react";
import { useStatsStore } from "../../store/useStatsStore";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { LuInfo } from "react-icons/lu";

export default function Stats() {
  // Subscribe to sessions to trigger re-renders when they change
  const sessions = useStatsStore((s) => s.sessions);
  
  // Calculate totals using useMemo to recalculate when sessions change
  const { todaySeconds, weekSeconds, monthSeconds, todaySessions } = useMemo(() => {
    const getTotalTimeToday = useStatsStore.getState().getTotalTimeToday;
    const getTotalTimeThisWeek = useStatsStore.getState().getTotalTimeThisWeek;
    const getTotalTimeThisMonth = useStatsStore.getState().getTotalTimeThisMonth;
    const getTodaySessions = useStatsStore.getState().getTodaySessions;

    return {
      todaySeconds: getTotalTimeToday(),
      weekSeconds: getTotalTimeThisWeek(),
      monthSeconds: getTotalTimeThisMonth(),
      todaySessions: getTodaySessions(),
    };
  }, [sessions]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format time range helper (e.g., "08:00 - 08:25")
  const formatTimeRange = (startTime: number, endTime: number): string => {
    const start = new Date(startTime * 1000);
    const end = new Date(endTime * 1000);
    
    const startHours = start.getHours();
    const startMinutes = start.getMinutes();
    const endHours = end.getHours();
    const endMinutes = end.getMinutes();
    
    const formatTime = (hours: number, minutes: number) => {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    };
    
    return `${formatTime(startHours, startMinutes)} - ${formatTime(endHours, endMinutes)}`;
  };


  return (
    <section>
       <BreadCrumb
        className="py-2 border-y border-stroke-500/40 mb-10"
        items={[{ title: "Stats" }]}
      />

      {/* Total Time Cards */}
      <div className="text-tertiary-400 text-sm font-light py-3 px-1 mb-4 rounded-sm bg-contrast-500/8 text-center w-full">
          <LuInfo className="inline mb-0.5 mr-2 stroke-contrast-500 " />
          Big update on Stats soon. 
        </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-main-600 border border-stroke-500 rounded-xs p-4">
          <p className="text-tertiary-400 text-sm mb-1">Today</p>
          <p className="text-2xl font-bold text-tertiary-500">
            {formatTime(todaySeconds)}
          </p>
        </div>
        <div className="bg-main-600 border border-stroke-500 rounded-xs p-4">
          <p className="text-tertiary-400 text-sm mb-1">This Week</p>
          <p className="text-2xl font-bold text-tertiary-500">
            {formatTime(weekSeconds)}
          </p>
        </div>
        <div className="bg-main-600 border border-stroke-500 rounded-xs p-4">
          <p className="text-tertiary-400 text-sm mb-1">This Month</p>
          <p className="text-2xl font-bold text-tertiary-500">
            {formatTime(monthSeconds)}
          </p>
        </div>
      </div>

      {/* Today's Work Sessions */}
      {todaySessions.length > 0 && (
        <div className="pt-3">
          <h3 className="text-lg text-tertiary-400 mb-4">
            Work Sessions Today
          </h3>
          <div className="space-y-2">
            {todaySessions.map((session) => {
              if (!session.endTime) return null;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between py-2 px-4 bg-main-600 rounded-xs border border-stroke-500 font-light"
                >
                  <span className="text-tertiary-400 ">
                    {formatTimeRange(session.startTime, session.endTime)}
                  </span>
                  <span className="text-tertiary-400 text-sm">
                    {formatTime(session.endTime - session.startTime)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {todaySessions.length === 0 && (
        <div className="bg-main-800 border border-stroke-500 rounded-lg p-6 text-center">
          <p className="text-tertiary-400">No work sessions recorded today</p>
        </div>
      )}
    </section>
  );
}

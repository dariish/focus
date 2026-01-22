import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoIosArrowForward } from "react-icons/io";
import BreadCrumb from "../../../shared/UI/BreadCrumb";
import { PATHS, useChangePage } from "../../config/routes";
import SideSectionHeader from "../ui/SideSectionHeader";
import SideSectionMid from "../ui/SideSectionMid";
import ToggleInput from "../../../shared/inputs/ToggleInput";
import { allSounds, useUIStore } from "../../store/useUIStore";
import { BsSoundwave } from "react-icons/bs";
import notificationPing1 from "../../../assets/notification-ping-1.mp3";
import notificationPing2 from "../../../assets/notification-ping-2.mp3";
import notificationPing3 from "../../../assets/notification-ping-3.mp3";
import notificationPing4 from "../../../assets/notification-ping-4.mp3";
import { LuInfo } from "react-icons/lu";

const soundMap: Record<string, string> = {
  "notification-ping-1.mp3": notificationPing1,
  "notification-ping-2.mp3": notificationPing2,
  "notification-ping-3.mp3": notificationPing3,
  "notification-ping-4.mp3": notificationPing4,
};

function SoundItem({
  sound,
  active,
  last = false,
  onClick,
}: {
  sound: { label: string; value: string };
  active: boolean;
  last?: boolean;
  onClick?: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  function playSound(e: React.MouseEvent<HTMLSpanElement>, sound: string) {
    e.stopPropagation();
    const soundPath = soundMap[sound];
    if (soundPath) {
      const audio = new Audio(soundPath);
      setIsPlaying(true);
      audio.play().catch((error) => {
        console.error("Error playing sound:", error);
        setIsPlaying(false);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
      });
    }
  }

  return (
    <li
      key={sound.value}
      className={`flex cursor-pointer bg-main-600 border-x border-stroke-500 group  duration-200 py-2 px-6 items-center gap-4 min-w-full relative overflow-hidden ${
        last ? "border-b border-stroke-500 rounded-b" : "mb-0.5"
      } ${active ? "bg-main-700" : "hover:bg-main-650"}`}
      onClick={onClick}
    >
      <div className="min-w-6 min-h-6 aspect-square border border-stroke-500 rounded-full relative ">
        <span
          className={`${
            active ? "bg-contrast-500" : "group-hover:bg-contrast-500/5"
          } inset-1 absolute  rounded-full duration-200`}
        ></span>
      </div>
      <div className="grow flex items-center justify-between gap-2">
        {sound.label}
        <span
          onClick={(e) => playSound(e, sound.value)}
          className={`text-tertiary-400 text-sm font-light p-2 bg-main-700  ${
            active
              ? "bg-main-750! hover:bg-main-800!"
              : "bg-main-700 hover:bg-main-750"
          } rounded`}
        >
          <BsSoundwave
            className={isPlaying ? "animate-spin text-contrast-500" : ""}
          />
        </span>
      </div>
    </li>
  );
}

export default function SideNotifications() {
  const changePage = useChangePage();
  const showSound = useUIStore((s) => s.showSound);
  const toggleSound = useUIStore((s) => s.toggleSound);
  const activeSound = useUIStore((s) => s.activeSound);
  const setActiveSound = useUIStore((s) => s.setActiveSound);
  const showNotifications = useUIStore((s) => s.showNotifications);
  const toggleNotifications = useUIStore((s) => s.toggleNotifications);
  const notificationPermission = useUIStore((s) => s.notificationPermission);
  const requestNotificationPermission = useUIStore(
    (s) => s.requestNotificationPermission
  );

  const activeSoundLabel = allSounds.find(
    (s) => s.value === activeSound
  )?.label;

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const hasAutoEnabledRef = useRef(false);

  // Sync notification permission state on mount and when permission changes
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      const currentPermission = Notification.permission;
      console.log("Current browser permission:", currentPermission);
      console.log("Store permission:", notificationPermission);

      // Update store if it's out of sync
      if (currentPermission !== notificationPermission) {
        console.log("Syncing permission state...");
        useUIStore.setState({ notificationPermission: currentPermission });
      }

      // If permission is granted and notifications are not enabled, enable them by default
      // But only once on initial mount when permission is first detected as granted
      if (
        currentPermission === "granted" &&
        !showNotifications &&
        !hasAutoEnabledRef.current
      ) {
        toggleNotifications();
        hasAutoEnabledRef.current = true;
      }
    }
  }, [notificationPermission]);

  const handleNotificationToggle = async () => {
    // If trying to enable but permission not granted, request it first
    if (!showNotifications && notificationPermission !== "granted") {
      await requestNotificationPermission();
      // Check if permission was granted after request
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        // Permission granted, enable notifications
        toggleNotifications();
        return;
      }
      // If permission not granted, don't toggle
      return;
    }
    // If permission is granted or already disabled, just toggle
    toggleNotifications();
  };

  const handleRequestPermission = async () => {
    console.log("Requesting notification permission...");

    // Check if browser supports notifications
    if (typeof Notification === "undefined") {
      alert("Your browser does not support notifications.");
      return;
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      alert(
        "Notifications require a secure context (HTTPS). Please access this site over HTTPS."
      );
      return;
    }

    console.log("Current permission:", Notification.permission);

    // If already granted, just enable notifications
    if (Notification.permission === "granted") {
      if (!showNotifications) {
        toggleNotifications();
      }
      return;
    }

    // Note: Even if permission is "denied", we'll try to request it again
    // Some browsers might allow it, or the user might have changed settings

    try {
      // Request permission directly - must be called from user interaction
      // This will show the browser's permission prompt
      const permission = await Notification.requestPermission();

      console.log("Permission result:", permission);

      // Update the store with the new permission
      useUIStore.setState({ notificationPermission: permission });

      // If permission is granted, also enable notifications
      if (permission === "granted") {
        console.log("Permission granted! Enabling notifications...");
        if (!showNotifications) {
          toggleNotifications();
        }
        // Test notification
        try {
          new Notification("Notifications Enabled!", {
            body: "You'll receive notifications when sequences change or the timer completes.",
            icon: "/timer.svg",
          });
        } catch (err) {
          console.error("Error showing test notification:", err);
        }
      } else if (permission === "denied") {
        // Permission was denied - show modal with instructions
        console.log("Permission denied by user");
        setShowPermissionModal(true);
      } else {
        // Permission is "default" - user dismissed the prompt
        console.log("Permission default - user dismissed the prompt");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      alert(
        "Failed to request notification permission. Error: " +
          (error as Error).message
      );
    }
  };

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
          { title: "Notifications" },
        ]}
        showBackButton={true}
        backButtonClassName="border border-stroke-500/60 bg-main-600 hover:bg-main-650 duration-250 h-full p-1.5"
        onBack={() => changePage(PATHS.SIDEPAGE.SETTINGS.MENU)}
        separator={<IoIosArrowForward className="fill-stroke-600 w-3 " />}
      />
      <SideSectionHeader
        title="Sound"
        content={activeSoundLabel}
        as="ul"
        showContainerProp={true}
      >
        <SideSectionMid
          containerClassName=""
          bottomBorder={showSound ? false : true}
        >
          <ToggleInput
            label="Play Sound"
            checked={showSound}
            onChange={() => toggleSound()}
          />
          <AnimatePresence>
            {showSound && (
              <motion.span
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="text-tertiary-400 text-sm font-light overflow-hidden mt-4 pt-4 border-t border-stroke-500/50"
              >
                Choose Sound
              </motion.span>
            )}
          </AnimatePresence>
        </SideSectionMid>

        <AnimatePresence>
          {showSound && (
            <motion.ul
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: undefined }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {allSounds.map((sound, index) => (
                <SoundItem
                  key={sound.value}
                  sound={sound}
                  active={activeSound === sound.value}
                  onClick={() => setActiveSound(sound.value)}
                  last={index === allSounds.length - 1}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </SideSectionHeader>

      <SideSectionHeader
        title="Browser Notifications"
        content={
          notificationPermission === "granted"
            ? "Enabled"
            : notificationPermission === "denied"
            ? "Blocked"
            : "Not requested"
        }
        as="div"
        showContainerProp={true}
        containerClassName="mt-4"
      >
        <SideSectionMid containerClassName="gap-4" bottomBorder={true}>
          {notificationPermission === "granted" && (
            <p className="flex items-center rounded-sm p-3 text-tertiary-500 text-xs font-light bg-contrast-500/8">
              <LuInfo className="inline mb-0.5 mr-2 stroke-contrast-500 " />
              You'll receive notifications when sequences change or the timer
              completes.
            </p>
          )}

          <div className="flex flex-col gap-4">
            <ToggleInput
              label="Show Notifications"
              checked={showNotifications}
              onChange={handleNotificationToggle}
              disabled={notificationPermission === "denied"}
            />
            {(notificationPermission === "default" ||
              (typeof Notification !== "undefined" &&
                Notification.permission === "default")) && (
              <div className="flex flex-col gap-2">
                <p className="text-tertiary-400 text-xs font-light">
                  Click the button below to request browser notification
                  permission.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Button clicked!");
                    console.log("Store permission:", notificationPermission);
                    console.log(
                      "Browser permission:",
                      typeof Notification !== "undefined"
                        ? Notification.permission
                        : "N/A"
                    );
                    handleRequestPermission();
                  }}
                  className="px-4 py-2 rounded border border-stroke-500 bg-main-700 hover:bg-main-750 text-tertiary-400 hover:text-tertiary-500 transition-all duration-300 ease-out cursor-pointer text-sm font-medium"
                >
                  Request Permission
                </button>
              </div>
            )}
            {notificationPermission === "denied" && (
              <div className="flex flex-col gap-2">
                <p className="flex items-center rounded-sm p-3 text-tertiary-500 text-xs font-light bg-red-500/8">
                  <LuInfo className="inline mb-0.5 mr-2 stroke-red-500 " />
                  Notifications are blocked. Click the button below to see
                  instructions on how to enable them.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPermissionModal(true);
                  }}
                  className="px-4 py-2 rounded border border-stroke-500 bg-main-700 hover:bg-main-750 text-tertiary-400 hover:text-tertiary-500 transition-all duration-300 ease-out cursor-pointer text-sm font-medium"
                >
                  <LuInfo className="inline mb-0.5 mr-2 stroke-tertiary-500 " />
                  Show Instructions
                </button>
              </div>
            )}
          </div>
        </SideSectionMid>
      </SideSectionHeader>

      {/* Permission Instructions Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPermissionModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="bg-main-600 border border-stroke-500 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-tertiary-500">
                      Enable Browser Notifications
                    </h2>
                    <button
                      onClick={() => setShowPermissionModal(false)}
                      className="text-tertiary-400 hover:text-tertiary-500 transition-colors text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-tertiary-400 text-sm mb-6">
                    Notifications are currently blocked. Follow these steps to
                    enable them:
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* Chrome/Edge */}
                    <div>
                      <h3 className="text-tertiary-500 font-medium mb-2">
                        Chrome / Edge:
                      </h3>
                      <ol className="list-decimal list-inside text-tertiary-400 text-sm space-y-1 ml-2">
                        <li>Click the lock icon in the address bar</li>
                        <li>Find "Notifications" in the permissions list</li>
                        <li>Change it from "Block" to "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>

                    {/* Firefox */}
                    <div>
                      <h3 className="text-tertiary-500 font-medium mb-2">
                        Firefox:
                      </h3>
                      <ol className="list-decimal list-inside text-tertiary-400 text-sm space-y-1 ml-2">
                        <li>Click the lock icon in the address bar</li>
                        <li>Click "More Information"</li>
                        <li>Go to the "Permissions" tab</li>
                        <li>Find "Notifications" and change to "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>

                    {/* Safari */}
                    <div>
                      <h3 className="text-tertiary-500 font-medium mb-2">
                        Safari:
                      </h3>
                      <ol className="list-decimal list-inside text-tertiary-400 text-sm space-y-1 ml-2">
                        <li>Go to Safari → Settings → Websites</li>
                        <li>Select "Notifications"</li>
                        <li>Find this website and change to "Allow"</li>
                        <li>Refresh the page</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        // First check current permission state
                        if (typeof Notification !== "undefined") {
                          const currentPermission = Notification.permission;

                          // If permission is now granted, refresh the page
                          if (currentPermission === "granted") {
                            // Update store before refresh
                            useUIStore.setState({
                              notificationPermission: "granted",
                            });
                            setShowPermissionModal(false);
                            // Small delay to ensure state is saved, then refresh
                            setTimeout(() => {
                              window.location.reload();
                            }, 100);
                            return;
                          }
                        }

                        // If not granted, try requesting again
                        await handleRequestPermission();

                        // Check again after request
                        if (typeof Notification !== "undefined") {
                          const newPermission = Notification.permission;
                          if (newPermission === "granted") {
                            // Permission was granted, refresh the page
                            useUIStore.setState({
                              notificationPermission: "granted",
                            });
                            setShowPermissionModal(false);
                            setTimeout(() => {
                              window.location.reload();
                            }, 100);
                          } else {
                            // Still denied, keep modal open with updated state
                            useUIStore.setState({
                              notificationPermission: newPermission,
                            });
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded border border-stroke-500 bg-main-700 hover:bg-main-750 text-tertiary-400 hover:text-tertiary-500 transition-all duration-300 ease-out cursor-pointer text-sm font-medium"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setShowPermissionModal(false)}
                      className="flex-1 px-4 py-2 rounded border border-stroke-500 bg-tertiary-500 hover:bg-tertiary-400 text-main-500 transition-all duration-300 ease-out cursor-pointer text-sm font-medium"
                    >
                      Got It
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

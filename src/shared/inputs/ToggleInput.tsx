import { motion } from "motion/react";

interface ToggleInputProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  containerClassName?: string;
  labelClassName?: string;
  toggleClassName?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export default function ToggleInput({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  containerClassName = "",
  labelClassName = "",
  toggleClassName = "",
  activeColor,
  inactiveColor,
}: ToggleInputProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      track: "w-9 h-5",
      thumb: "w-4 h-4",
      translateX: 16, // 4 * 4px (Tailwind spacing)
    },
    md: {
      track: "w-11 h-6",
      thumb: "w-4.5 h-4.5",
      translateX: 23, // 5 * 4px
    },
    lg: {
      track: "w-14 h-7",
      thumb: "w-6 h-6",
      translateX: 28, // 7 * 4px
    },
  };

  const config = sizeConfig[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-1 ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={label}
          className={`text-sm font-medium text-tertiary-400 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <button
        id={label}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex items-center rounded focus:outline-none ring-2 ring-transparent hover:ring-main-300 focus:ring-stroke-500 focus:ring-offset-2 focus:ring-offset-main-300 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${config.track} ${toggleClassName} ${
          checked
            ? activeColor
              ? ""
              : "bg-contrast-400"
            : inactiveColor
            ? ""
            : "bg-main-700 border-2 border-stroke-500"
        }`}
        style={
          activeColor || inactiveColor
            ? {
                backgroundColor: checked ? activeColor : inactiveColor,
              }
            : undefined
        }
      >
        <motion.div
          className={`absolute left-0.1 rounded-sm bg-white shadow-md ${config.thumb}`}
          animate={{
            x: checked ? config.translateX : 2, // 2px for left-0.5 spacing
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 55,
          }}
          whileTap={disabled ? {} : { scale: 0.95 }}
        />
      </button>
    </div>
  );
}

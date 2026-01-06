import { motion } from "framer-motion";

interface CheckBoxItemProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  colorVariant?: string;
  size?: number;
}

export function CheckBoxItem({
  checked,
  onChange,
  colorVariant = "blue",
  size = 28,
}: CheckBoxItemProps) {
  return (
    <label
      className="relative inline-block cursor-pointer select-none outline-none group aspect-square"
      style={{ width: size, height: size }}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      <motion.div
        animate={checked ? { scale: [1, 1, 1] } : { scale: 1 }}
        whileTap={{ scale: 1 }}
        whileHover={{ scale: checked ? 1 : 1.01 }}
        transition={{ duration: 0.2 }}
        className={`
          relative w-full h-full rounded-xs ring-1 outline outline-main-300  border transition-colors duration-200 flex items-center justify-center
          ${
            checked
              ? `bg-main-300 border-stroke-500! `
              : `bg-main-300 border-stroke-500!`
          }
        `}
        style={
          {
            borderColor: colorVariant,
            "--tw-ring-color": colorVariant,
          } as React.CSSProperties
        }
      >
        <motion.svg
          className="w-4 h-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.path
            d="M4 12L10 18L20 6"
            fill="transparent"
            strokeWidth="3"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              delay: checked ? 0.1 : 0,
            }}
          />
        </motion.svg>
      </motion.div>
    </label>
  );
}

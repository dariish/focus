import { motion } from "motion/react";

export default function ButtonConfirm({
  onClick,
  children,
  className = "",
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      style={{
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
      className={`py-1 px-4 rounded-xs text-tertiary-500 bg-secondary-500 duration-300 ease-out cursor-pointer group flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </motion.button>
  );
}

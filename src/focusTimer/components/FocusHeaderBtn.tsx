import React from "react";

export default function FocusHeaderBtn({
  onClick,
  icon,
  className,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      onClick={onClick}
      className={`group h-full aspect-square flex items-center justify-center duration-300 hover:bg-main-600 cursor-pointer p-2 rounded border border-transparent hover:border-stroke-500 active:border-secondary-500 ${
        className ?? ""
      }`}
    >
      {icon}
    </li>
  );
}

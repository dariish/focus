import React from "react";

export default function FocusHeaderBtn({
  onClick,
  icon,
  className,
  active = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <li
      onClick={onClick}
      className={`group h-full aspect-square flex items-center justify-center duration-300 hover:bg-main-600 cursor-pointer p-2 rounded border border-transparent hover:border-stroke-500  active:border-contrast-500 ${
        active ? "border-stroke-500! bg-main-600" : ""
      } ${className ?? ""} `}
    >
      {icon}
    </li>
  );
}

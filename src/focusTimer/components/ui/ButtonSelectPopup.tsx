import React from "react";

export default function ButtonSelectPopup({
  icon = "",
  title,
  onClick,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between mx-0.5 my-0.5 rounded-xs px-2 py-1.5 text-sm text-left hover:bg-main-700 transition-colors ${className}`}
    >
      {title}
      {icon}
    </button>
  );
}

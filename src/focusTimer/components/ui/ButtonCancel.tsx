import React from "react";

export default function ButtonCancel({
  onClick,
  children,
  className = "",
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xs text-sm text-tertiary-500 hover:bg-main-650 transition-colors cursor-pointer bg-main-550 ${className}`}
    >
      {children}
    </button>
  );
}

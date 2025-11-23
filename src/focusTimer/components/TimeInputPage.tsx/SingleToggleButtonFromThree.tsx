import React, { useLayoutEffect, useRef, useState } from "react";

export default function SingleToggleButtonFromThree({
  onClick,
  label,
  icon,
  active,
}: {
  onClick: () => void;
  label: String;
  icon: React.ReactNode;
  active: boolean;
}) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  useLayoutEffect(() => {
    if (!labelRef.current) return;
    if (active) {
      setLabelWidth(labelRef.current.scrollWidth);
    } else {
      setLabelWidth(0);
    }
  }, [active, label]);

  return (
    <button
      onClick={onClick}
      className={`flex items-center border border-transparent rounded-xs cursor-pointer duration-200 px-3 sm:px-2 py-1 text-base sm:text-xl  ${
        active
          ? "bg-contrast-500/50 border-contrast-500!"
          : "hover:bg-contrast-500/20 hover:border-contrast-500/40!"
      }`}
    >
      {icon}
      <span
        ref={labelRef}
        className="inline-flex overflow-hidden whitespace-nowrap  duration-200"
        style={{
          width: labelWidth,
          opacity: active ? 1 : 0,
          marginLeft: active ? `10px` : "0px",
        }}
        aria-hidden={!active}
      >
        {label}
      </span>
    </button>
  );
}

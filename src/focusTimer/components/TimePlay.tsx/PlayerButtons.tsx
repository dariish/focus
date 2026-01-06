import React from "react";
import { FaPause, FaStop } from "react-icons/fa";
import { RiSettings4Fill } from "react-icons/ri";

export default function PlayerButtons() {
  const buttonClassName =
    "p-5 rounded-full border border-main-400  hover:rotate-4 active:scale-90 active:rotate-0 transition-all duration-300 ease-out cursor-pointer hover:border-stroke-500 hover:bg-gradient-to-tr hover:from-main-500 hover:to-main-300/10 group relative overflow-hidden";
  const absoluteClassName =
    "absolute inset-0 bg-gradient-to-r from-transparent via-main-800/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out";
  return (
    <div className="flex items-center gap-4 mt-5">
      <button className={buttonClassName}>
        <div className={absoluteClassName}></div>
        <div className="relative z-10 p-0.5">
          <FaStop className="w-3.5 h-3.5 fill-current text-tertiary-500  transition-colors duration-300" />
        </div>
      </button>
      <button className={buttonClassName}>
        <div className={absoluteClassName}></div>
        <div className="relative z-10">
          <FaPause className="w-7 h-7 fill-current text-tertiary-500  transition-colors duration-300" />
        </div>
      </button>
      <button className={buttonClassName}>
        <div className={absoluteClassName}></div>
        <div className="relative z-10">
          <RiSettings4Fill className="w-4 h-4 fill-current text-tertiary-500  transition-colors duration-300" />
        </div>
      </button>
    </div>
  );
}

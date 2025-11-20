import React from "react";
import { IoIosArrowForward } from "react-icons/io";

export default function SettingsMenuItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="group flex border border-secondary-400 bg-main-700 rounded shadow-lg p-3 cursor-pointer items-center gap-3 duration-250 hover:shadow-xl hover:border-secondary-500">
      {icon}
      <div className="flex flex-col">
        <span className="">{title}</span>
        <span className="text-tertiary-400 leading-[0.9rem] text-sm group-hover:text-tertiary-500 duration-250">
          {description}
        </span>
      </div>
      <IoIosArrowForward className="ml-auto fill-stroke-700 group-hover:fill-teriary-500 duration-250" />
    </li>
  );
}

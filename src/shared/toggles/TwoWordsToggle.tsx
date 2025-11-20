import { useState } from "react";
import type { SidePage } from "../../focusTimer/components/sideBar/TimeSideBar";

export default function TwoWordsToggle({
  onChange,
  firstLabel,
  secondLabel,
}: {
  onChange: (val: SidePage) => void;
  firstLabel: string;
  secondLabel: string;
}) {
  const [blueOverlayToggle, setblueOverlayToggle] = useState(true);
  function toggleBetween(bool: boolean) {
    if (bool !== blueOverlayToggle) {
      onChange(bool ? "tasks" : "stats");
      setblueOverlayToggle(bool);
    }
  }
  console.log("blueOverlayToggle");
  console.log(blueOverlayToggle);

  return (
    <div className="relative gap-1 rounded-full inline-flex items-center justify-between  bg-main-700 border-2 border-main-900 ">
      <div
        className={`cursor-default absolute top-1 bottom-1 ${
          blueOverlayToggle ? "left-1 right-[50%]" : "right-1 left-[50%]"
        }  rounded-full bg-secondary-500 duration-250`}
      />
      <span
        onClick={() => toggleBetween(true)}
        className={`z-2 w-1/2 px-10 py-2 rounded-full text-center text-nowrap sm:text-lg ${
          !blueOverlayToggle
            ? "cursor-pointer hover:text-secondary-700"
            : "cursor-default"
        }`}
      >
        {firstLabel}
      </span>
      <span
        onClick={() => toggleBetween(false)}
        className={`z-2 w-1/2 px-10 py-2 rounded-full text-center text-nowrap sm:text-lg duration-500 ${
          blueOverlayToggle
            ? "cursor-pointer hover:text-secondary-700"
            : "cursor-default"
        }`}
      >
        {secondLabel}
      </span>
    </div>
  );
}

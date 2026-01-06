import React, { type InputHTMLAttributes } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
  inputClassName?: string;
  inputContainerClassName?: string;
}

export default function NumberInput({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  suffix = "",
  label,
  labelClassName = "",
  containerClassName = "",
  inputClassName = "",
  inputContainerClassName = "",
  disabled,
  ...props
}: NumberInputProps) {
  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9]/g, "");

    if (inputValue === "") {
      onChange(0);
      return;
    }

    let numValue = parseInt(inputValue, 10);
    while (numValue > max && inputValue.length > 0) {
      inputValue = inputValue.slice(1);
      numValue = parseInt(inputValue, 10);
    }

    if (isNaN(numValue)) {
      onChange(0);
      return;
    }

    onChange(numValue);
  };

  const handleBlur = () => {
    if (value < min) {
      onChange(min);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label
          className={`text-sm font-medium  text-tertiary-500 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center overflow-hidden justify-between bg-main-700 focus-within:bg-main-750 border-b-2 border-stroke-500 focus-within:ring-3 
          focus-within:border-main-800 ring-stroke-500 rounded-sm focus-within:outline-2 outline-main-300 duration-500 transition-colors ${
            disabled ? "opacity-50" : "hover:border-stroke-600"
          } duration-200  ${inputContainerClassName}`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="group border-r-2 px-1.5 py-[11px] bg-main-700 border-stroke-500 cursor-pointer hover:bg-main-750  text-tertiary-400 hover:text-tertiary-500 disabled:cursor-default disabled:opacity-30 disabled:hover:text-tertiary-400 duration-250 z-10"
        >
          <FaChevronLeft
            size={11}
            className="fill-tertiary-400 group-hover:fill-tertiary-500 duration-200"
          />
        </button>

        <div className="relative grow h-full group flex items-end gap-0.5 justify-center cursor-text">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`bg-transparent text-right outline-none text-tertiary-200 font-medium focus:text-tertiary-500 duration-200 min-w-[1ch] ${inputClassName}`}
            style={{ width: `${Math.max(1, value.toString().length)}ch` }}
            {...props}
          />
          <span className="mb-0.5 text-tertiary-400 text-xs font-light ml-px select-none group-focus-within:text-tertiary-500 duration-200">
            {suffix}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="group border-l-2  px-1.5 py-[11px] bg-main-700 border-stroke-500 cursor-pointer hover:bg-main-750  text-tertiary-400 hover:text-tertiary-500 disabled:cursor-default disabled:opacity-30 disabled:hover:text-tertiary-400 duration-250 z-10"
        >
          <FaChevronRight
            size={11}
            className="fill-tertiary-400 group-hover:fill-tertiary-500 duration-200"
          />
        </button>
      </div>
    </div>
  );
}

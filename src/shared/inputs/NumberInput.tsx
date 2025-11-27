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
          className={`text-sm font-medium text-tertiary-400 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <div
        className={`flex items-center justify-between bg-main-600 border border-stroke-500 rounded-sm  hover:border-stroke-600 ${
          disabled ? "opacity-50" : "hover:border-stroke-400"
        } duration-200 focus-within:border-stroke-600 ${inputContainerClassName}`}
      >
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="border-r p-3 border-stroke-500  cursor-pointer hover:bg-secondary-500/10 text-tertiary-400 hover:text-tertiary-200 disabled:cursor-default disabled:opacity-30 disabled:hover:text-tertiary-400 transition-colors z-10"
        >
          <FaChevronLeft size={10} />
        </button>

        <div className="relative grow text-center h-full group">
          <div className="flex items-end justify-center pointer-events-none group-focus-within:text-contrast-500 duration-200">
            <span
              className={`text-tertiary-200 font-medium group-focus-within:text-contrast-500 duration-200 ${inputClassName}`}
            >
              {value}
            </span>
            <span className="mb-px text-tertiary-500 text-sm font-light ml-px select-none group-focus-within:text-contrast-500 duration-200">
              {suffix}
            </span>
          </div>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-center z-20"
            {...props}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="border-l p-3 border-stroke-500  cursor-pointer hover:bg-secondary-500/10 text-tertiary-400 hover:text-tertiary-200 disabled:cursor-default disabled:opacity-30 disabled:hover:text-tertiary-400 transition-colors z-10"
        >
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

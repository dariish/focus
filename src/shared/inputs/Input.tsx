import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
}

export default function Input({
  className = "",
  containerClassName = "",
  labelClassName = "",
  label,
  error,
  ...props
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={props.id}
          className={`text-sm font-medium text-tertiary-400 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-1.5 text-tertiary-500 bg-main-700 focus:bg-main-750 border-b-2  focus:ring-3 ring-stroke-500 rounded-sm placeholder:text-tertiary-400/60 placeholder:font-light  focus:outline-2 outline-main-300 duration-500 transition-colors ${
          error
            ? "border-red-400"
            : "border-stroke-500 focus:border-main-800 hover:border-stroke-600"
        } ${className}`}
        {...props}
      />
      {/* {error && <span className="text-xs text-red-500">{error}</span>} */}
    </div>
  );
}

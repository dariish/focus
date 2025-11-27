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
        className={`w-full px-3 py-2 text-tertiary-500 bg-main-600 border rounded-sm placeholder:text-tertiary-600 focus:outline-none focus:border-stroke-600  duration-200 ${
          error ? "border-red-500" : "border-stroke-500 hover:border-stroke-600"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

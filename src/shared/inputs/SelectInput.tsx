import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size,
  useDismiss,
  useRole,
  useClick,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
} from "@floating-ui/react";
import { FaChevronDown } from "react-icons/fa";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  optionClassName?: string;
  error?: string;
}

export default function SelectInput({
  value,
  onChange,
  options,
  label,
  placeholder = "Select an option",
  disabled = false,
  containerClassName = "",
  labelClassName = "",
  selectClassName = "",
  optionClassName = "",
  error,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(5),
      flip(),
      shift(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string | number) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={`flex items-center justify-between gap-1 w-full ${containerClassName}`}
    >
      {label && (
        <label
          className={`text-sm font-medium text-tertiary-400 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type="button"
        disabled={disabled}
        className={`min-w-[170px] px-3 py-1.5 text-left text-tertiary-500 bg-main-700 focus:bg-main-750 border-b-2 focus:ring-3 ring-stroke-500 rounded-sm focus:outline-2 outline-main-300 duration-500 transition-colors flex items-center justify-between ${
          error
            ? "border-red-400"
            : "border-stroke-500 focus:border-main-800 hover:border-stroke-600"
        } ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${selectClassName}`}
      >
        <span
          className={`${
            selectedOption ? "text-tertiary-500" : "text-tertiary-400/60"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaChevronDown className="w-3 h-3 text-tertiary-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                className="z-50 focus:outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="bg-main-300 p-1 border border-stroke-500 rounded-sm shadow-xl min-w-full max-h-60 overflow-y-auto"
                >
                  {options.map((option) => {
                    const isSelected = option.value === value;
                    const isDisabled = option.disabled || false;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSelect(option.value)}
                        className={`w-full rounded mb-0.5 px-3 py-2 text-left text-sm text-tertiary-500  focus:bg-main-650 focus:outline-none transition-colors duration-200 ${
                          isSelected
                            ? "bg-main-550 font-medium cursor-default!"
                            : "bg-transparent hover:bg-main-500 cursor-pointer"
                        } ${
                          isDisabled ? "opacity-50 cursor-not-allowed" : ""
                        } ${optionClassName}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </motion.div>
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </AnimatePresence>
      {/* {error && <span className="text-xs text-red-500">{error}</span>} */}
    </div>
  );
}

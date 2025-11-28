"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, cssClamp } from "@/kits/utils";
import { CheckIcon } from "lucide-react";
import { useControllableState } from "@/kits/hooks/use-controllable-state";

export interface SelectDrawerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export const SelectDrawer = (props: SelectDrawerProps) => {
  const {
    value: valueProp,
    defaultValue: defaultValueProp,
    onChange: onChangeProp,
    placeholder = "Chọn một tùy chọn",
    options = [],
    disabled = false,
    className,
    error = false,
    ...rest
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValueProp,
    onChange: onChangeProp,
  });

  // Update selectedValue when value prop changes
  useEffect(() => {
    if (valueProp !== undefined) {
      setSelectedValue(valueProp);
    }
  }, [valueProp]);

  const handleSelect = useCallback(
    (option: { label: string; value: string }) => {
      setSelectedValue(option.value);
      setIsOpen(false);
    },
    [setSelectedValue],
  );

  const displayText = selectedValue
    ? options.find((option) => option.value === selectedValue)?.label
    : placeholder;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={cn(
          "rounded-full bg-white px-5 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400",
          disabled && "cursor-not-allowed opacity-50",
          className,
          { "ring-2 ring-red-400": error },
        )}
      >
        <button
          type="button"
          className={cn(
            "w-full cursor-pointer border-none bg-transparent text-left font-vnm-sans-display text-blue-600 outline-none",
            { "text-slate-400": !selectedValue },
            disabled && "cursor-not-allowed",
          )}
          style={{
            fontSize: cssClamp(16, 28, 250, 500),
          }}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(true)}
          {...rest}
        >
          {displayText}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "tween",
                ease: [0.25, 0.46, 0.45, 0.94],
                duration: 0.4,
              }}
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
            >
              {/* Handle */}
              <div
                className="flex justify-center pb-2 pt-3"
                onClick={() => setIsOpen(false)}
                onTouchStart={() => setIsOpen(false)}
              >
                <div className="h-1 w-12 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4">
                <h3
                  className="font-vnm-sans-display text-lg tracking-wide text-gray-900"
                  style={{
                    fontSize: cssClamp(20, 24, 250, 500),
                  }}
                >
                  {placeholder}
                </h3>
              </div>

              {/* Options List */}
              <div className="max-h-[60vh] overflow-y-auto">
                {options.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">Không có tùy chọn nào</div>
                ) : (
                  <div className="py-2">
                    {options.map((option, index) => {
                      const isSelected = selectedValue && selectedValue === option.value;

                      return (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: index * 0.03,
                            duration: 0.3,
                            ease: "easeOut",
                          }}
                          type="button"
                          onClick={() => handleSelect(option)}
                          className={cn(
                            "w-full px-6 py-3 text-left font-vnm-sans-display transition-colors duration-200",
                            {
                              "text-slate-600 hover:bg-[#3459ff] hover:text-white focus:bg-[#3459ff] focus:text-white focus:outline-none":
                                !isSelected,
                            },
                            {
                              "bg-[#050ba9] text-white": isSelected,
                            },
                          )}
                          style={{
                            fontSize: cssClamp(20, 24, 250, 500),
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                  type: "spring",
                                  damping: 15,
                                  stiffness: 300,
                                  duration: 0.4,
                                }}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white"
                              >
                                <CheckIcon className="h-4 w-4 text-[#050ba9]" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

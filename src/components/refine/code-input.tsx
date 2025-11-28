import { cn } from "@/kits/utils";
import { useControllableState } from "@/kits/hooks/use-controllable-state";
import { memo, useRef, useState, useEffect, KeyboardEvent } from "react";
import { CommonUtil } from "@/kits/utils/common.util";

export interface CodeInputProps {
  value?: string;
  defaultValue?: string;
  length?: number; // Length of the code input (default 4)
  type?: "text" | "number" | "password"; // Loại input
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  separator?: string; // Character separator between inputs (default " ")
  layout?: string; // Layout pattern like "*** ***" or "****"
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void; // Callback when the code is complete
}

export const CodeInput = memo((props: CodeInputProps) => {
  const {
    value: valueProp,
    defaultValue: defaultValueProp = "",
    length = 4,
    type = "text",
    disabled = false,
    readOnly = false,
    autoFocus = false,
    separator = " ",
    layout,
    onChange: onChangeProp,
    onComplete,
  } = props;

  const ids = useRef({ container: CommonUtil.nanoid("alphaLower") });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const [value, setValue] = useControllableState<string>({
    prop: valueProp,
    defaultProp: defaultValueProp,
    onChange: onChangeProp,
  });

  // Create array of characters from value
  const characters = (value || "").split("").slice(0, length);
  while (characters.length < length) {
    characters.push("");
  }

  // Process layout pattern
  const getLayoutPattern = () => {
    if (layout) {
      // Parse layout pattern like "*** ***" or "****"
      const pattern = layout.replace(/\*/g, "input").replace(/\s/g, "separator");
      return pattern.split(/(input|separator)/).filter(Boolean);
    }
    return null;
  };

  const layoutPattern = getLayoutPattern();

  // Auto focus on the first input when component mounts
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  // Call onComplete when the code is complete
  useEffect(() => {
    if (value && value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow 1 character
    const newChar = inputValue.slice(-1);

    // Validate input based on type
    if (type === "number" && newChar && !/^\d$/.test(newChar)) {
      return;
    }

    const newCharacters = [...characters];
    newCharacters[index] = newChar;

    const newValue = newCharacters.join("");
    setValue(newValue);

    // Auto focus on the next input if there is a character
    if (newChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    const currentValue = characters[index];

    switch (e.key) {
      case "Backspace":
        e.preventDefault();
        if (currentValue) {
          // Delete the current character
          const newCharacters = [...characters];
          newCharacters[index] = "";
          setValue(newCharacters.join(""));
        } else if (index > 0) {
          // Move to the previous input and delete the character
          const newCharacters = [...characters];
          newCharacters[index - 1] = "";
          setValue(newCharacters.join(""));
          inputRefs.current[index - 1]?.focus();
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        if (index < length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
        break;

      case "Delete":
        e.preventDefault();
        const newCharacters = [...characters];
        newCharacters[index] = "";
        setValue(newCharacters.join(""));
        break;

      default:
        // Only allow valid characters
        if (
          type === "number" &&
          !/^\d$/.test(e.key) &&
          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
        ) {
          e.preventDefault();
        }
        break;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const cleanData = type === "number" ? pastedData.replace(/\D/g, "") : pastedData;

    if (cleanData.length > 0) {
      const newValue = cleanData.slice(0, length);
      setValue(newValue);

      // Focus on the last input with data
      const lastFilledIndex = Math.min(newValue.length - 1, length - 1);
      if (lastFilledIndex >= 0) {
        inputRefs.current[lastFilledIndex]?.focus();
      }
    }
  };

  const renderInputs = () => {
    if (layoutPattern) {
      // Render theo layout pattern
      let inputIndex = 0;
      return layoutPattern.map((item, index) => {
        if (item === "input") {
          if (inputIndex >= length) return null;
          const char = characters[inputIndex];
          const currentIndex = inputIndex;
          inputIndex++;

          return (
            <input
              key={`input-${currentIndex}`}
              ref={(el) => {
                if (el) {
                  inputRefs.current[currentIndex] = el;
                }
              }}
              type={type === "password" ? "password" : type === "number" ? "text" : "text"}
              inputMode={type === "number" ? "numeric" : "text"}
              value={char}
              onChange={(e) => handleInputChange(currentIndex, e.target.value)}
              onKeyDown={(e) => handleKeyDown(currentIndex, e)}
              onPaste={handlePaste}
              onFocus={() => setFocusedIndex(currentIndex)}
              onBlur={() => setFocusedIndex(-1)}
              disabled={disabled || readOnly}
              className={cn(
                "h-12 w-12 rounded-lg border-2 !bg-white text-center font-vnm-sans-display text-2xl font-semibold !text-blue-600 !outline-none transition-all",
                "text-content-1 bg-transparent",
                "border-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600",
                {
                  "cursor-not-allowed opacity-50": disabled || readOnly,
                  "ring-2 ring-blue-600": focusedIndex === currentIndex,
                },
              )}
              maxLength={1}
              autoComplete="off"
            />
          );
        } else if (item === "separator") {
          return (
            <span key={`separator-${index}`} className="text-content-3 mx-1">
              {separator}
            </span>
          );
        }
        return null;
      });
    } else {
      // Render default with separator
      return characters.map((char, index) => (
        <div key={index} className="flex items-center">
          <input
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type={type === "password" ? "password" : type === "number" ? "text" : "text"}
            inputMode={type === "number" ? "numeric" : "text"}
            value={char}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            disabled={disabled || readOnly}
            className={cn(
              "h-12 w-12 rounded-lg border-2 !bg-white text-center font-vnm-sans-display text-2xl font-semibold !text-blue-600 !outline-none transition-all",
              "text-content-1 bg-transparent",
              "border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600",
              {
                "cursor-not-allowed opacity-50": disabled || readOnly,
                "ring-2 ring-blue-600": focusedIndex === index,
              },
            )}
            maxLength={1}
            autoComplete="off"
          />
          {index < length - 1 && <span className="text-content-3 mx-0.5" />}
        </div>
      ));
    }
  };

  return (
    <div className="relative w-fit">
      <div className="flex items-center justify-center gap-1">{renderInputs()}</div>
    </div>
  );
});

CodeInput.displayName = "CodeInput";

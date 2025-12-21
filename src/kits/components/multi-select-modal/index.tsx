import { useDebounce } from "@/kits/hooks";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { Modal } from "@/kits/components/Modal";
import React from "react";
import { LoadingBar } from "@/kits/components/LoadingBar";
import { Search } from "@/kits/components/Search";
import { HighlightText } from "@/kits/components/HighlightText";

const constants = {
  INSTANCE_NAME: "MultiSelectModal",
};

const messages = {
  noOptions: "No options",
  noOptionsFound: "No options found",
  done: "Done",
};

const styles = {
  label: StyleUtil.cn("block text-sm font-normal text-gray-70 mb-2 line-clamp-2"),
  triggerButton: (error: boolean, loading: boolean) =>
    StyleUtil.cn(
      "h-10 px-4 block w-full text-left bg-gray-10 border-b border-b-gray-60",
      "hover:bg-gray-20 enabled:focus:outline enabled:focus:outline-2 enabled:focus:outline-primary-60 enabled:-outline-offset-2",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      {
        "border-b-red-60": error,
      },
      { "border-b-gray-10": loading },
    ),
  selectedLabel: (grayout: boolean) =>
    StyleUtil.cn("block line-clamp-1 text-sm w-full bg-transparent text-gray-100", {
      "text-gray-50": grayout,
    }),
  helperText: StyleUtil.cn("text-sm mt-1 text-gray-70 line-clamp-3"),
  searchWrapper: StyleUtil.cn("mb-8"),
  optionsList: StyleUtil.cn("divide-y divide-gray-20 max-h-[360px] overflow-y-auto"),
  option: (isSelected: boolean, isDisabled: boolean) =>
    StyleUtil.cn(
      "flex items-center gap-3 text-left w-full px-4 py-3 text-sm line-clamp-1",
      {
        "bg-primary-50 text-white": isSelected,
        "hover:bg-gray-10": !isSelected && !isDisabled,
        "opacity-50 cursor-not-allowed": isDisabled,
      },
    ),
  checkbox: StyleUtil.cn(
    "w-5 h-5 rounded border-2 border-gray-60 cursor-pointer",
    "checked:bg-white checked:border-white",
    "focus:outline focus:outline-2 focus:outline-primary-60 focus:-outline-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  optionLabel: StyleUtil.cn("flex-1"),
  noOptions: StyleUtil.cn("text-sm bg-gray-10 text-gray-70 text-center py-4"),
  footer: StyleUtil.cn("flex items-center justify-between mt-4 pt-4 border-t border-gray-20"),
  selectedCount: StyleUtil.cn("text-sm text-gray-70"),
  doneButton: StyleUtil.cn(
    "px-4 py-2 bg-primary-60 text-white rounded text-sm",
    "hover:bg-primary-70 active:bg-primary-80",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
};

type Option = {
  label: string;
  value: any;
  key?: string | number;
  disabled?: boolean;
};

export interface MultiSelectModalProps {
  options: Option[];
  selectedValues?: any[];
  defaultValues?: any[];
  onSelect?: (values: any[]) => void;
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  messages?: Partial<typeof messages>;
  maxSelections?: number;
  disabled?: boolean;
}

export const MultiSelectModal = React.memo((props: MultiSelectModalProps) => {
  const {
    options,
    selectedValues: selectedValuesProp = [],
    defaultValues: defaultValuesProp = [],
    onSelect: onSelectProp,
    label,
    helperText,
    error = false,
    loading = false,
    placeholder = "Select options",
    searchPlaceholder = "Search options",
    messages: messagesProp = messages,
    maxSelections,
    disabled = false,
  } = props;

  const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

  const ids = React.useRef({
    container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
    triggerButton: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "input"),
    helperText: StringUtil.createElementId(
      constants.INSTANCE_NAME,
      instanceId.current,
      "helper-text",
    ),
    option: (index: number) =>
      StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "option", index),
  });

  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const [displayOptions, setDisplayOptions] = React.useState(options);
  const [searchInput, setSearchInput] = React.useState("");
  const [selectedValues, setSelectedValues] = React.useState<any[]>(
    selectedValuesProp.length > 0 ? selectedValuesProp : defaultValuesProp,
  );

  const [isOpen, setIsOpen] = React.useState(false);

  const debouncedSearch = useDebounce(searchInput, 100);

  // Update selected values when prop changes
  React.useEffect(() => {
    if (selectedValuesProp.length > 0 || selectedValuesProp.length === 0) {
      setSelectedValues(selectedValuesProp);
    }
  }, [selectedValuesProp]);

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchInput("");
  };

  const handleToggleOption = (optionValue: any) => {
    if (disabled) return;

    const currentValues = [...selectedValues];
    const isSelected = currentValues.includes(optionValue);

    if (isSelected) {
      const newValues = currentValues.filter((v) => v !== optionValue);
      setSelectedValues(newValues);
      onSelectProp?.(newValues);
    } else {
      // Check max selections
      if (maxSelections && currentValues.length >= maxSelections) {
        return; // Don't add if max selections reached
      }
      const newValues = [...currentValues, optionValue];
      setSelectedValues(newValues);
      onSelectProp?.(newValues);
    }
  };

  const handleLabelClick = () => {
    buttonRef.current?.focus();
  };

  // Filter options based on search
  React.useEffect(() => {
    React.startTransition(() => {
      setDisplayOptions(StringUtil.wildCardSearch(options, debouncedSearch));
    });
  }, [options, debouncedSearch]);

  // Reset search when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setSearchInput("");
    }
  }, [isOpen]);

  const selectedOptions = React.useMemo(() => {
    return options.filter((opt) => selectedValues.includes(opt.value));
  }, [options, selectedValues]);

  const displayText =
    selectedOptions.length > 0
      ? `${selectedOptions.length} selected`
      : placeholder;

  return (
    <div id={ids.current.container}>
      {/* Label */}
      <label onClick={handleLabelClick} className={styles.label}>
        {label}
      </label>

      {/* Select */}
      <button
        ref={buttonRef}
        id={ids.current.triggerButton}
        type="button"
        disabled={loading || disabled}
        className={styles.triggerButton(error, loading)}
        onClick={handleOpen}
      >
        <span className={styles.selectedLabel(selectedOptions.length === 0)}>
          {displayText}
        </span>
      </button>

      {/* Loading */}
      <LoadingBar size="small" active={loading} />

      {/* Helper text */}
      <p id={ids.current.helperText} className={styles.helperText}>
        {helperText}
      </p>

      {/* Options Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} title={label}>
        <div className="p-4">
          {/* Search */}
          <div className={styles.searchWrapper}>
            <Search
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={(value) => setSearchInput(value)}
            />
          </div>

          {/* Options */}
          <div className={styles.optionsList}>
            {displayOptions.length > 0 &&
              displayOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isDisabled =
                  option.disabled ||
                  (maxSelections
                    ? !isSelected && selectedValues.length >= maxSelections
                    : false);

                return (
                  <Option
                    key={option.key ?? `${instanceId.current}-option-${index}`}
                    id={ids.current.option(index)}
                    option={option}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onClick={() => handleToggleOption(option.value)}
                    searchValue={debouncedSearch}
                  />
                );
              })}

            {displayOptions.length === 0 && searchInput.length === 0 && (
              <p className={styles.noOptions}>{messagesProp.noOptions}</p>
            )}

            {displayOptions.length === 0 && searchInput.length > 0 && (
              <p className={styles.noOptions}>{messagesProp.noOptionsFound}</p>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span className={styles.selectedCount}>
              {selectedValues.length > 0
                ? `${selectedValues.length} selected`
                : "No selection"}
            </span>
            <button
              type="button"
              className={styles.doneButton}
              onClick={handleClose}
            >
              {messagesProp.done}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

MultiSelectModal.displayName = constants.INSTANCE_NAME;

interface OptionProps {
  id: string;
  option: Option;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  searchValue?: string;
}

const Option = React.memo((props: OptionProps) => {
  const { id, option, isSelected, isDisabled, onClick, searchValue } = props;

  return (
    <button
      id={id}
      type="button"
      className={styles.option(isSelected, isDisabled)}
      onClick={onClick}
      disabled={isDisabled}
      tabIndex={0}
    >
      <span className={styles.optionLabel}>
        <HighlightText text={option.label} highlightValue={searchValue || ""} />
      </span>
    </button>
  );
});

Option.displayName = `${constants.INSTANCE_NAME}.Option`;


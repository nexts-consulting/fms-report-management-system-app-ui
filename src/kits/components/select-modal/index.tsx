import { useControllableState, useDebounce } from "@/kits/hooks";
import { CommonUtil, StringUtil, StyleUtil, DomUtil } from "@/kits/utils";
import { Modal } from "@/kits/components/modal";
import React from "react";
import { LoadingBar } from "@/kits/components/loading-bar";
import { Search } from "@/kits/components/search";
import { HighlightText } from "@/kits/components/highlight-text";

const constants = {
  INSTANCE_NAME: "SelectModal",
};

const messages = {
  noOptions: "No options",
  noOptionsFound: "No options found",
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
  option: (isSelected: boolean) =>
    StyleUtil.cn(
      "block text-left w-full px-4 py-3 text-sm line-clamp-1",
      {
        "bg-primary-50 text-white": isSelected,
      },
      { "hover:bg-gray-10 ": !isSelected },
    ),
  noOptions: StyleUtil.cn("text-sm bg-gray-10 text-gray-70 text-center py-4"),
};

type Option = {
  label: string;
  value: any;
  key?: string | number;
};

export interface SelectModalProps {
  options: Option[];
  selectedOption?: Option | null;
  defaultOption?: Option | null;
  onSelect?: (option: Option | null) => void;
  label?: string;
  helperText?: string | React.ReactNode;
  error?: boolean;
  loading?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  messages?: Partial<typeof messages>;
}

export const SelectModal = React.memo((props: SelectModalProps) => {
  const {
    options,
    selectedOption: selectedOptionProp,
    defaultOption: defaultOptionProp = undefined,
    onSelect: onSelectProp,
    label,
    helperText,
    error = false,
    loading = false,
    placeholder = "Select an option",
    searchPlaceholder = "Search options",
    messages: messagesProp = messages,
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
  const [selectedOption, setSelectedOption] = useControllableState<Option | null>({
    prop: selectedOptionProp,
    defaultProp: defaultOptionProp !== undefined ? defaultOptionProp : (options[0] ?? null),
    onChange: onSelectProp,
  });

  const [isOpen, setIsOpen] = React.useState(false);

  const debouncedSearch = useDebounce(searchInput, 100);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSelectOption = (option: Option) => {
    setSelectedOption(option);
    handleClose();
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
    setSearchInput("");
  }, [isOpen]);

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
        disabled={loading}
        className={styles.triggerButton(error, loading)}
        onClick={handleOpen}
      >
        <span className={styles.selectedLabel(!selectedOption?.label)}>
          {selectedOption?.label ?? placeholder}
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
              displayOptions.map((option, index) => (
                <Option
                  key={option.key ?? `${instanceId.current}-option-${index}`}
                  id={ids.current.option(index)}
                  option={option}
                  isSelected={option.value === selectedOption?.value}
                  onClick={() => handleSelectOption(option)}
                  searchValue={debouncedSearch}
                />
              ))}

            {displayOptions.length === 0 && searchInput.length === 0 && (
              <p className={styles.noOptions}>{messagesProp.noOptions}</p>
            )}

            {displayOptions.length === 0 && searchInput.length > 0 && (
              <p className={styles.noOptions}>{messagesProp.noOptionsFound}</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
});

SelectModal.displayName = constants.INSTANCE_NAME;

interface OptionProps {
  id: string;
  option: Option;
  isSelected: boolean;
  onClick: () => void;
  searchValue?: string;
}

const Option = React.memo((props: OptionProps) => {
  const { id, option, isSelected, onClick, searchValue } = props;

  // Autoscroll to the option when it is selected
  React.useEffect(() => {
    if (isSelected) {
      DomUtil.scrollToElementById(id, { behavior: "instant", block: "center" });
    }
  }, [isSelected, id]);

  return (
    <button
      id={id}
      type="button"
      className={styles.option(isSelected)}
      onClick={onClick}
      tabIndex={0}
    >
      <HighlightText text={option.label} highlightValue={searchValue || ""} />
    </button>
  );
});

Option.displayName = `${constants.INSTANCE_NAME}.Option`;

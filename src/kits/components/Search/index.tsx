import React from "react";
import { CommonUtil, StringUtil, StyleUtil } from "@/kits/utils";
import { Icons } from "@/kits/components/icons";
import { useMergeRefs } from "@/kits/hooks/use-merge-refs";
import { useControllableState } from "@/kits/hooks";
import { IconButton } from "@/kits/components/icon-button";

const constants = {
  INSTANCE_NAME: "Search",
};

const styles = {
  searchIconWrapper: StyleUtil.cn("h-10 w-10 flex shrink-0 items-center justify-center"),
  searchIcon: StyleUtil.cn("text-gray-70"),
  inputWrapper: StyleUtil.cn(
    "flex items-center justify-between cursor-text border-b bg-gray-10 border-b-gray-60 ",
    "has-[input:focus]:outline has-[input:focus]:outline-2 has-[input:focus]:outline-primary-60 has-[input:focus]:-outline-offset-2",
  ),
  input: StyleUtil.cn("text-sm bg-transparent h-10 w-full text-gray-100 placeholder:text-gray-50"),
};

export interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const Search = React.memo(
  React.forwardRef<HTMLInputElement, SearchProps>((props, ref) => {
    const {
      value: valueProp,
      defaultValue: defaultValueProp,
      onChange: onChangeProp,
      ...rest
    } = props;

    const instanceId = React.useRef(CommonUtil.nanoid("alphaLower"));

    const ids = React.useRef({
      container: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current),
      input: StringUtil.createElementId(constants.INSTANCE_NAME, instanceId.current, "input"),
    });

    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = useMergeRefs(ref, inputRef);

    const [value, setValue] = useControllableState<string>({
      prop: valueProp,
      defaultProp: defaultValueProp,
      onChange: onChangeProp,
    });

    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };

    return (
      <div id={ids.current.container}>
        <div className={styles.inputWrapper} onClick={handleFocus}>
          <div className={styles.searchIconWrapper}>
            <Icons.Search className={styles.searchIcon} />
          </div>
          <input
            ref={mergedRef}
            id={ids.current.input}
            type="text"
            value={value}
            onChange={handleChange}
            {...rest}
            className={styles.input}
          />
          {(value?.length ?? 0) > 0 && (
            <IconButton
              aria-label="Clear"
              size="large"
              variant="gray-10"
              onClick={() => setValue("")}
              icon={Icons.Close}
            />
          )}
        </div>
      </div>
    );
  }),
);

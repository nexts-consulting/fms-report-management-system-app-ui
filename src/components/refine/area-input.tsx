import { useControllableState } from "@/kits/hooks/use-controllable-state";
import { cn } from "@/kits/utils";
import TextareaAutosize from "react-textarea-autosize";

export interface AreaInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
}

export const AreaInput = (props: AreaInputProps) => {
  const {
    value: valueProp,
    defaultValue: defaultValueProp,
    onChange: onChangeProp,
    error = false,
    minRows = 1,
    maxRows = 10,
    maxLength = 1000,
  } = props;

  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValueProp,
    onChange: onChangeProp,
  });

  return (
    <>
      <div
        className={cn(
          "rounded-full bg-white px-5 py-2 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-400",
          { "ring-2 ring-red-400": error },
        )}
      >
        <TextareaAutosize
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "w-full border-none bg-transparent font-vnm-sans-display text-[24px] text-blue-600 outline-none",
            "placeholder:text-slate-400",
          )}
          minRows={minRows}
          maxRows={maxRows}
          maxLength={maxLength}
        />
      </div>
    </>
  );
};

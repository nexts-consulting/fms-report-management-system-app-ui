import { useControllableState } from "@/kits/hooks/use-controllable-state";
import { cn, cssClamp } from "@/kits/utils";

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: boolean;
}

export const TextInput = (props: TextInputProps) => {
  const {
    value: valueProp,
    defaultValue: defaultValueProp,
    onChange: onChangeProp,
    error = false,
    ...rest
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
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "w-full border-none bg-transparent font-vnm-sans-display text-blue-600 outline-none",
            "placeholder:text-slate-400",
          )}
          style={{
            fontSize: cssClamp(16, 28, 250, 500),
          }}
          {...rest}
        />
      </div>
    </>
  );
};

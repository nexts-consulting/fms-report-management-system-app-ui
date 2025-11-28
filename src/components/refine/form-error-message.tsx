import { Icons } from "@/kits/components/Icons";
import { ErrorMessage } from "@hookform/error-message";
import { FieldErrors } from "react-hook-form";

export interface FormErrorMessageProps {
  name: string;
  errors: FieldErrors<any>;
}

export const FormErrorMessage = (props: FormErrorMessageProps) => {
  const { name, errors } = props;

  return (
    <ErrorMessage
      name={name}
      errors={errors}
      render={({ message }) => (
        <div className="ml-2 mt-1 flex items-center justify-start gap-2">
          <Icons.WarningFilled className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{message}</p>
        </div>
      )}
    />
  );
};

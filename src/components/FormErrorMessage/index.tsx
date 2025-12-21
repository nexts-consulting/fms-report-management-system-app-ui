import { Icons } from "@/kits/components/icons";
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
        <div className="flex items-center justify-start gap-2">
          <Icons.WarningFilled className="shrink-0 text-red-60" />
          <p className="text-sm text-red-60">{message}</p>
        </div>
      )}
    />
  );
};

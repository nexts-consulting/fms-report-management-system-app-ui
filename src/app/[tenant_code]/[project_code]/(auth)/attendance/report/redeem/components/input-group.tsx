import { UseFormRegister, FieldErrors } from "react-hook-form";
import { StyleUtil } from "@/kits/utils";

interface ReportProductItem {
  id: string;
  name: string;
  skuCode: string;
  unit?: string;
}

interface ReportProductInputGroupProps {
  items: ReportProductItem[];
  register: UseFormRegister<any>;
  formValues: any;
  errors: FieldErrors;
  isLocked?: boolean;
}

export const ReportProductInputGroup = ({
  items,
  register,
  formValues,
  errors,
  isLocked = false,
}: ReportProductInputGroupProps) => {
  return (
    <div className="divide-y divide-gray-200 bg-white">
      {items.map((item) => {
        const hasValue =
          formValues?.items?.[item.skuCode]?.pcs !== undefined &&
          formValues?.items?.[item.skuCode]?.pcs !== null &&
          !Number.isNaN(formValues?.items?.[item.skuCode]?.pcs);

        return (
          <div key={item.id} className="p-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">SKU: {item.skuCode}</p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <span className="text-sm text-gray-500">{item.unit || "Pcs"}</span>
                <input
                  type="number"
                  min="0"
                  disabled={isLocked}
                  {...register(`items.${item.skuCode}.pcs`, {
                    valueAsNumber: true
                  })}
                  className={StyleUtil.cn(
                    "w-20 border px-3 py-2 text-right font-medium focus:outline-none focus:ring-2 focus:ring-primary-50",
                    {
                      "border-red-500": errors.items && (errors.items as any)?.[item.skuCode]?.pcs,
                      "border-gray-300":
                        !errors.items || !(errors.items as any)?.[item.skuCode]?.pcs,
                      "border-green-30 bg-green-10/10": hasValue,
                    },
                  )}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

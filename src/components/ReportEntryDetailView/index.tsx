"use client";

import React, { useState } from "react";
import { FormConfig, FieldConfig } from "@/components/DynamicForm/types";
import { format } from "date-fns";
import { shouldDisplayField } from "@/components/DynamicForm/utils";
import { Modal } from "@/kits/components/modal";
import { Icons } from "@/kits/components/icons";
import { Button } from "@/kits/components/button";

interface ReportEntryDetailViewProps {
  data: Record<string, any>;
  formConfig: FormConfig;
}

interface ImagePreviewState {
  images: string[];
  currentIndex: number;
  fieldLabel?: string;
}

/**
 * Format value based on field type
 */
const formatFieldValue = (
  field: FieldConfig,
  value: any,
  onImageClick?: (images: string[], index: number, fieldLabel?: string) => void,
): string | React.ReactNode => {
  if (value === null || value === undefined || value === "") {
    return "–";
  }

  switch (field.type) {
    case "text":
    case "textarea":
    case "masked":
      return String(value);

    case "number":
      return typeof value === "number" ? value.toLocaleString("vi-VN") : String(value);

    case "currency":
      const currencyValue = typeof value === "number" ? value : parseFloat(value);
      if (isNaN(currencyValue)) return String(value);
      const currency = (field as any).currency || "VND";
      return `${currencyValue.toLocaleString("vi-VN")} ${currency}`;

    case "percentage":
      const percentageValue = typeof value === "number" ? value : parseFloat(value);
      if (isNaN(percentageValue)) return String(value);
      const decimals = (field as any).decimals || 0;
      return `${percentageValue.toFixed(decimals)}%`;

    case "select":
    case "multiselect":
      // Assume label = value (as per user requirement)
      if (Array.isArray(value)) {
        return value.map((v) => String(v)).join(", ");
      }
      return String(value);

    case "checkbox":
      return value === true ? "Có" : "Không";

    case "switch":
      return value === true ? "Bật" : "Tắt";

    case "date":
      try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return String(value);
        return format(date, "dd/MM/yyyy");
      } catch {
        return String(value);
      }

    case "time":
      return String(value);

    case "datetime":
      try {
        const dateTime = new Date(value);
        if (isNaN(dateTime.getTime())) return String(value);
        return format(dateTime, "dd/MM/yyyy HH:mm");
      } catch {
        return String(value);
      }

    case "dateRange":
      if (typeof value === "object" && value !== null) {
        const start = value.start ? format(new Date(value.start), "dd/MM/yyyy") : "–";
        const end = value.end ? format(new Date(value.end), "dd/MM/yyyy") : "–";
        return `${start} - ${end}`;
      }
      return String(value);

    case "imageCapture":
      if (typeof value === "string" && value) {
        return (
          <div className="mt-2">
            <img
              src={value}
              alt={field.label || "Image"}
              className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onImageClick?.([value], 0, field.label);
              }}
            />
          </div>
        );
      }
      return "–";

    case "multipleImagesCapture":
      if (Array.isArray(value) && value.length > 0) {
        return (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {value.map((url: string, index: number) => (
              <img
                key={index}
                src={url}
                alt={`${field.label || "Image"} ${index + 1}`}
                className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick?.(value, index, field.label);
                }}
              />
            ))}
          </div>
        );
      }
      return "–";

    case "inputGroup":
    case "groupedInputGroup":
      if (typeof value === "object" && value !== null) {
        const fieldConfig = field as any;
        const fieldNamePrefix = fieldConfig.fieldNamePrefix || "items";
        const fieldNameSuffix = fieldConfig.fieldNameSuffix || "pcs";
        
        // Get items from field config if available
        const configItems = Array.isArray(fieldConfig.items) ? fieldConfig.items : [];
        
        // Extract items from value object (format: items.SKU001.pcs = quantity)
        const items: Array<{ code: string; name: string; quantity: number; unit?: string }> = [];
        
        // Try to get items from nested structure (items.SKU001.pcs)
        if (fieldNamePrefix && fieldNameSuffix) {
          Object.keys(value).forEach((key) => {
            if (value[key] && typeof value[key] === "object") {
              Object.keys(value[key]).forEach((subKey) => {
                const qty = value[key][subKey];
                if (typeof qty === "number" && qty > 0) {
                  const configItem = configItems.find((item: any) => item.code === key);
                  items.push({
                    code: key,
                    name: configItem?.name || key,
                    quantity: qty,
                    unit: configItem?.unit || fieldNameSuffix,
                  });
                }
              });
            } else if (typeof value[key] === "number" && value[key] > 0) {
              // Direct mapping (products.SKU001 = quantity)
              const configItem = configItems.find((item: any) => item.code === key);
              items.push({
                code: key,
                name: configItem?.name || key,
                quantity: value[key],
                unit: configItem?.unit || fieldNameSuffix,
              });
            }
          });
        } else {
          // Fallback: direct object entries
          Object.entries(value)
            .filter(([_, qty]) => (qty as number) > 0)
            .forEach(([code, qty]) => {
              const configItem = configItems.find((item: any) => item.code === code);
              items.push({
                code,
                name: configItem?.name || code,
                quantity: qty as number,
                unit: configItem?.unit || "pcs",
              });
            });
        }
        
        if (items.length === 0) {
          return "Không có dữ liệu";
        }

        return (
          <div className="mt-2">
            <table className="min-w-full border divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    Tên
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                    Số lượng
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.code}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {item.name}
                      {item.code !== item.name && (
                        <span className="text-xs text-gray-500 ml-2">({item.code})</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      {item.quantity.toLocaleString("vi-VN")} {item.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return "–";

    default:
      return String(value);
  }
};

/**
 * Render a single field
 */
const renderField = (
  field: FieldConfig,
  data: Record<string, any>,
  onImageClick?: (images: string[], index: number, fieldLabel?: string) => void,
): React.ReactNode => {
  // Check if field should be displayed based on conditional rules
  if (!shouldDisplayField(field, data)) {
    return null;
  }

  const value = data[field.name];
  const formattedValue = formatFieldValue(field, value, onImageClick);

  // Fields that should display full width (vertical layout)
  const fullWidthFields = [
    "imageCapture",
    "multipleImagesCapture",
    "inputGroup",
    "groupedInputGroup",
  ];

  const isFullWidth = fullWidthFields.includes(field.type);

  if (isFullWidth) {
    return (
      <div key={field.name} className="py-2">
        <div className="text-sm text-gray-600 mb-2">{field.label || field.name}:</div>
        <div className="text-sm font-medium text-gray-900">{formattedValue}</div>
      </div>
    );
  }

  return (
    <div key={field.name} className="flex justify-between items-start py-2">
      <span className="text-sm text-gray-600 flex-1">{field.label || field.name}:</span>
      <span className="text-sm font-medium text-gray-900 text-right flex-1 ml-4">
        {formattedValue}
      </span>
    </div>
  );
};

/**
 * Report Entry Detail View Component
 * Renders form data in a read-only view based on form configuration
 */
export const ReportEntryDetailView: React.FC<ReportEntryDetailViewProps> = ({
  data,
  formConfig,
}) => {
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);

  // Get all fields from sections or flat fields
  const allFields: FieldConfig[] = React.useMemo(() => {
    if (formConfig.sections) {
      return formConfig.sections.flatMap((section) => section.fields);
    }
    if (formConfig.fields) {
      return formConfig.fields;
    }
    return [];
  }, [formConfig]);

  const handleImageClick = (images: string[], index: number, fieldLabel?: string) => {
    setImagePreview({ images, currentIndex: index, fieldLabel });
  };

  const handleClosePreview = () => {
    setImagePreview(null);
  };

  const handlePrevImage = () => {
    if (imagePreview && imagePreview.currentIndex > 0) {
      setImagePreview({
        ...imagePreview,
        currentIndex: imagePreview.currentIndex - 1,
      });
    }
  };

  const handleNextImage = () => {
    if (imagePreview && imagePreview.currentIndex < imagePreview.images.length - 1) {
      setImagePreview({
        ...imagePreview,
        currentIndex: imagePreview.currentIndex + 1,
      });
    }
  };

  // Group fields by sections
  const sections = formConfig.sections || [];

  return (
    <>
      {sections.length > 0 ? (
        // Render with sections
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => {
            const visibleFields = section.fields.filter((field) =>
              shouldDisplayField(field, data),
            );

            if (visibleFields.length === 0) {
              return null;
            }

            return (
              <div key={sectionIndex} className="space-y-2">
                {section.title && (
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h4>
                )}
                {section.description && (
                  <p className="text-xs text-gray-500 mb-3">{section.description}</p>
                )}
                <div className="space-y-2 border border-gray-200 p-4">
                  {visibleFields.map((field) => renderField(field, data, handleImageClick))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Render flat fields
        <div className="space-y-2 border border-gray-200 p-4">
          {allFields
            .filter((field) => shouldDisplayField(field, data))
            .map((field) => renderField(field, data, handleImageClick))}
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <Modal
          isOpen={true}
          onClose={handleClosePreview}
          title={
            imagePreview.images.length > 1
              ? `${imagePreview.fieldLabel || "Hình ảnh"} (${imagePreview.currentIndex + 1}/${imagePreview.images.length})`
              : imagePreview.fieldLabel || "Hình ảnh"
          }
        >
          <div className="relative">
            <img
              src={imagePreview.images[imagePreview.currentIndex]}
              alt={`Preview ${imagePreview.currentIndex + 1}`}
              className="h-[65vh] w-full bg-gray-10 object-contain object-center"
            />

            {/* Navigation buttons for multiple images */}
            {imagePreview.images.length > 1 && (
              <>
                {imagePreview.currentIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10"
                    aria-label="Previous image"
                  >
                    <Icons.ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {imagePreview.currentIndex < imagePreview.images.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all z-10"
                    aria-label="Next image"
                  >
                    <Icons.ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};


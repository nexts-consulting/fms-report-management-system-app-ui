"use client";

import React from "react";
import { DynamicForm } from "@/components/DynamicForm";
import { FormConfig } from "@/components/DynamicForm/types";
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingOverlay } from "@/kits/components/loading-overlay";
import { useRouter } from "next/navigation";
import { hydrateFormConfig } from "@/components/DynamicForm/formConfigSerializer";
import exampleJsonConfig from "@/components/DynamicForm/exampleJsonConfig.json";

export default function ReportPage() {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [submittedData, setSubmittedData] = React.useState<Record<string, any> | null>(null);
  const [useJsonConfig, setUseJsonConfig] = React.useState(true); // Toggle between JSON-based and code-based config
  const router = useRouter();

  // Hydrate JSON config to runtime config (simulates loading from database)
  const hydratedJsonConfig = React.useMemo(() => {
    return hydrateFormConfig(exampleJsonConfig);
  }, []);
  // CODE-BASED CONFIG (with functions and Date objects - NOT suitable for database storage)
  const codeBasedFormConfig: FormConfig = {
    title: "Dynamic Form Demo (Code-Based)",
    description: "This form uses code-based config with functions and Date objects (NOT suitable for database storage).",
    gridColumns: 12,
    submitLabel: "Submit Form",
    cancelLabel: "Reset",
    showSubmit: true,
    showCancel: true,
    sections: [
      {
        title: "Text & Number Inputs",
        description: "Basic text and number input fields",
        fields: [
          {
            name: "fullName",
            type: "text",
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true,
            span: 12,
            validation: [
              { type: "required", message: "Full name is required" },
              { type: "minLength", value: 2, message: "Name must be at least 2 characters" },
            ],
          },
          {
            name: "email",
            type: "text",
            label: "Email Address",
            placeholder: "example@email.com",
            inputType: "email",
            required: true,
            span: 12,
            validation: [
              { type: "required", message: "Email is required" },
              { type: "email", message: "Please enter a valid email address" },
            ],
          },
          {
            name: "description",
            type: "textarea",
            label: "Description",
            placeholder: "Enter a description",
            rows: 4,
            span: 122,
            validation: [
              { type: "maxLength", value: 500, message: "Description must be less than 500 characters" },
            ],
          },
          {
            name: "age",
            type: "number",
            label: "Age",
            placeholder: "Enter your age",
            min: 0,
            max: 120,
            span: 12,
            validation: [
              { type: "min", value: 0, message: "Age must be at least 0" },
              { type: "max", value: 120, message: "Age must be at most 120" },
            ],
          },
          {
            name: "salary",
            type: "currency",
            label: "Salary",
            placeholder: "0",
            currency: "VND",
            decimals: 0,
            min: 0,
            span: 12,
          },
          {
            name: "discount",
            type: "percentage",
            label: "Discount",
            placeholder: "0",
            min: 0,
            max: 200,
            decimals: 2,
            span: 12,
          },
          {
            name: "phone",
            type: "masked",
            label: "Phone Number",
            placeholder: "(123) 456-7890",
            mask: "phone",
            span: 12,
          },
          {
            name: "code",
            type: "masked",
            label: "Product Code",
            placeholder: "ABC-123",
            mask: "code",
            span: 12,
          },
        ],
      },
      {
        title: "Selection Fields",
        description: "Select, multi-select, checkbox, radio, and switch fields",
        fields: [
          {
            name: "country",
            type: "select",
            label: "Country",
            placeholder: "Select a country",
            required: true,
            span: 12,
            options: [
              { label: "Vietnam", value: "vn" },
              { label: "United States", value: "us" },
              { label: "United Kingdom", value: "uk" },
              { label: "Japan", value: "jp" },
              { label: "South Korea", value: "kr" },
            ],
            validation: [{ type: "required", message: "Please select a country" }],
          },
          {
            name: "languages",
            type: "multiselect",
            label: "Languages",
            placeholder: "Select languages",
            span: 12,
            maxSelections: 5,
            options: [
              { label: "Vietnamese", value: "vi" },
              { label: "English", value: "en" },
              { label: "Japanese", value: "ja" },
              { label: "Korean", value: "ko" },
              { label: "Chinese", value: "zh" },
              { label: "French", value: "fr" },
            ],
          },
          {
            name: "termsAccepted",
            type: "checkbox",
            label: "Terms and Conditions",
            checkboxLabel: "I accept the terms and conditions",
            required: true,
            span: 122,
            validation: [
              {
                type: "custom",
                validator: (value) => value === true,
                message: "You must accept the terms and conditions",
              },
            ],
          },
          {
            name: "notifications",
            type: "switch",
            label: "Notifications",
            switchLabel: "Enable email notifications",
            span: 122,
          },
        ],
      },
      {
        title: "Date & Time Fields",
        description: "Date, time, datetime, and date range pickers",
        fields: [
          {
            name: "birthDate",
            type: "date",
            label: "Birth Date",
            format: "YYYY-MM-DD",
            maxDate: new Date(),
            span: 12,
          },
          {
            name: "appointmentTime",
            type: "time",
            label: "Appointment Time",
            format: "24h",
            span: 12,
          },
          {
            name: "eventDateTime",
            type: "datetime",
            label: "Event Date & Time",
            format: "YYYY-MM-DD HH:mm",
            span: 12,
          },
          {
            name: "vacationRange",
            type: "dateRange",
            label: "Vacation Period",
            format: "YYYY-MM-DD",
            span: 122,
          },
        ],
      },
      {
        title: "Image Upload",
        description: "Image capture and upload field",
        fields: [
          {
            name: "profileImage",
            type: "imageCapture",
            label: "Profile Image",
            helperText: "Take a photo or upload an image",
            span: 122,
            cloudConfig: {
              provider: "firebase",
              path: "images/uploads/fms-report-management-system-app-ui-test",
            },
          },
        ],
      },
      {
        title: "Conditional Fields",
        description: "Fields that appear based on other field values",
        fields: [
          {
            name: "hasVehicle",
            type: "switch",
            label: "Do you have a vehicle?",
            span: 122,
          },
          {
            name: "vehicleType",
            type: "select",
            label: "Vehicle Type",
            placeholder: "Select vehicle type",
            span: 12,
            options: [
              { label: "Car", value: "car" },
              { label: "Motorcycle", value: "motorcycle" },
              { label: "Bicycle", value: "bicycle" },
            ],
            conditional: [
              {
                field: "hasVehicle",
                operator: "equals",
                value: true,
              },
            ],
          },
          {
            name: "vehicleModel",
            type: "text",
            label: "Vehicle Model",
            placeholder: "Enter vehicle model",
            span: 12,
            conditional: [
              {
                field: "hasVehicle",
                operator: "equals",
                value: true,
              },
            ],
          },
        ],
      },
      {
        title: "Input Group",
        description: "List of items with number inputs (like product quantity input)",
        fields: [
          {
            name: "products",
            type: "inputGroup",
            label: "Sản phẩm",
            helperText: "Nhập số lượng cho từng sản phẩm",
            span: 12,
            items: [
              {
                code: "SKU001",
                name: "Sản phẩm A",
                description: "Quà tặng: Túi xách",
                unit: "pcs",
              },
              {
                code: "SKU002",
                name: "Sản phẩm B",
                description: "Quà tặng: Áo thun",
                unit: "pcs",
              },
              {
                code: "SKU003",
                name: "Sản phẩm C",
                description: "Quà tặng: Mũ bảo hiểm",
                unit: "pcs",
              },
              {
                code: "SKU004",
                name: "Sản phẩm D",
                description: "Quà tặng: Bình nước",
                unit: "pcs",
              },
            ],
            fieldNamePrefix: "items",
            fieldNameSuffix: "pcs",
            min: 0,
            layout: "flex",
            showButtons: true,
          },
        ],
      },
      {
        title: "Grouped Input Group",
        description: "Items grouped by category (like products grouped by brand)",
        fields: [
          {
            name: "productsByBrand",
            type: "groupedInputGroup",
            label: "Sản phẩm theo thương hiệu",
            helperText: "Nhập số lượng cho từng sản phẩm, được nhóm theo thương hiệu",
            span: 12,
            items: [
              {
                code: "SKU001",
                name: "Sản phẩm A1",
                description: "SKU: SKU001",
                unit: "pcs",
                groupKey: "Brand A",
                data: { brand: "Brand A", category: "Electronics" },
              },
              {
                code: "SKU002",
                name: "Sản phẩm A2",
                description: "SKU: SKU002",
                unit: "pcs",
                groupKey: "Brand A",
                data: { brand: "Brand A", category: "Electronics" },
              },
              {
                code: "SKU003",
                name: "Sản phẩm B1",
                description: "SKU: SKU003",
                unit: "pcs",
                groupKey: "Brand B",
                data: { brand: "Brand B", category: "Fashion" },
              },
              {
                code: "SKU004",
                name: "Sản phẩm B2",
                description: "SKU: SKU004",
                unit: "pcs",
                groupKey: "Brand B",
                data: { brand: "Brand B", category: "Fashion" },
              },
              {
                code: "SKU005",
                name: "Sản phẩm C1",
                description: "SKU: SKU005",
                unit: "pcs",
                groupKey: "Brand C",
                data: { brand: "Brand C", category: "Home" },
              },
            ],
            groupBy: "brand",
            formatGroupTitle: (groupKey, items) => `${groupKey} (${items.length} sản phẩm)`,
            fieldNamePrefix: "items",
            fieldNameSuffix: "pcs",
            min: 0,
            layout: "flex",
            showButtons: false,
          },
        ],
      },
    ],
  };

  // Select config based on toggle
  const formConfig = useJsonConfig ? hydratedJsonConfig : codeBasedFormConfig;

  const handleSubmit = (data: Record<string, any>) => {
    console.log("Form submitted with data:", data);
    setSubmittedData(data);
    alert("Form submitted! Check console for data.");
  };

  const handleChange = (data: Record<string, any>, fieldName: string, value: any) => {
    setFormData(data);
  };

  const handleCancel = () => {
    setFormData({});
    setSubmittedData(null);
  };

  return (
    <>
      <LoadingOverlay active={false} />

      <ScreenHeader
        title="Báo cáo"
        onBack={() => router.back()}
      />
      
      <div className="flex flex-col gap-4 p-4 pt-0">
        {/* Config Type Toggle */}
        <div className="bg-white border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Configuration Type</h3>
            <button
              onClick={() => {
                setUseJsonConfig(!useJsonConfig);
                setFormData({});
                setSubmittedData(null);
              }}
              className="px-4 py-2 bg-primary-50 text-white hover:bg-primary-60 transition-colors text-sm"
            >
              Switch to {useJsonConfig ? "Code-Based" : "JSON-Based"}
            </button>
          </div>
          
          <div className="text-sm text-gray-70">
            {useJsonConfig ? (
              <div>
                <p className="font-semibold text-green-600 mb-1">JSON-Based Config (Database Safe)</p>
                <p>This config can be stored in database. Functions and dates are converted to special string references:</p>
                <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                  <li><code className="bg-gray-10 px-1 py-0.5 rounded">@@DATE_NOW</code> - Current date/time</li>
                  <li><code className="bg-gray-10 px-1 py-0.5 rounded">@@DATE_TODAY</code> - Today at midnight</li>
                  <li><code className="bg-gray-10 px-1 py-0.5 rounded">@@VALIDATOR:validatorName</code> - Predefined validator</li>
                  <li><code className="bg-gray-10 px-1 py-0.5 rounded">@@FORMATTER:formatterName</code> - Predefined formatter</li>
                  <li><code className="bg-gray-10 px-1 py-0.5 rounded">@@UPLOAD_PROVIDER:providerName</code> - Upload provider</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-red-600 mb-1">Code-Based Config (NOT Database Safe)</p>
                <p>This config contains functions and Date objects that cannot be serialized to JSON for database storage.</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Form */}
        <DynamicForm
          config={formConfig}
          initialValues={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        {/* Submitted Data Display */}
        {submittedData && (
          <div className="mt-4 p-4 bg-gray-10 border border-gray-30 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Submitted Data:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}


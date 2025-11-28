import ExcelJS from "exceljs";
import { ColumnDefinition, ReportData } from "@/app/[tenant_code]/(auth)/reports/components/types";
import dayjs from "dayjs";

interface ExportExcelOptions {
  filename?: string;
  sheetName?: string;
  title?: string;
  includeHeader?: boolean;
  includeGroups?: boolean;
  includeSummary?: boolean;
}

/**
 * Format cell value based on column definition type
 */
const formatCellValue = (
  value: any,
  columnDef: ColumnDefinition
): string | number | null => {
  if (value === null || value === undefined) {
    return "";
  }

  switch (columnDef.type) {
    case "text":
      return String(value);

    case "number":
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(numValue)) return "";
      // Return number for Excel to format properly, prefix/suffix will be handled in cell style if needed
      return numValue;

    case "date":
      if (!value) return "";
      const date = dayjs(value);
      if (!date.isValid()) return "";
      if (columnDef.options?.showTime) {
        return date.format("DD/MM/YYYY HH:mm:ss");
      }
      const format = columnDef.options?.format || "DD/MM/YYYY";
      return date.format(format);

    case "boolean":
      const boolValue =
        typeof value === "boolean"
          ? value
          : typeof value === "string"
            ? value.toLowerCase() === "true" || value === "1"
            : value === 1;
      return columnDef.options?.trueLabel && columnDef.options?.falseLabel
        ? boolValue
          ? columnDef.options.trueLabel
          : columnDef.options.falseLabel
        : boolValue
          ? "Có"
          : "Không";

    case "tag":
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return String(value);

    case "image":
      if (Array.isArray(value)) {
        return value.join("; ");
      }
      return String(value);

    case "link":
      return String(value);

    case "badge":
      return typeof value === "number" ? value : parseFloat(String(value)) || "";

    default:
      return String(value);
  }
};

/**
 * Export report data to Excel file
 */
export const exportReportToExcel = async (
  columnDefinitions: ColumnDefinition[],
  data: ReportData,
  options: ExportExcelOptions = {}
): Promise<void> => {
  const {
    filename = `report_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}.xlsx`,
    sheetName = "Báo cáo",
    title,
    includeHeader = true,
    includeGroups = true,
    includeSummary = true,
  } = options;

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  // Disable gridlines
  worksheet.views = [{ showGridLines: false }];

  // Define styles
  const headerStyle = {
    font: {
      bold: true,
      color: { argb: "FF000000" },
      size: 11,
    },
    fill: {
      type: "pattern" as const,
      pattern: "solid" as const,
      fgColor: { argb: "FFE0E0E0" }, // Gray
    },
    alignment: {
      vertical: "middle" as const,
      horizontal: "center" as const,
      wrapText: false,
    },
    border: {
      top: { style: "thin" as const, color: { argb: "FF808080" } },
      left: { style: "thin" as const, color: { argb: "FF808080" } },
      bottom: { style: "thin" as const, color: { argb: "FF808080" } },
      right: { style: "thin" as const, color: { argb: "FF808080" } },
    },
  };

  const cellStyle = {
    alignment: {
      vertical: "middle" as const,
      wrapText: false,
    },
    border: {
      top: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
      left: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
      bottom: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
      right: { style: "thin" as const, color: { argb: "FFD3D3D3" } },
    },
  };

  const numberCellStyle = {
    ...cellStyle,
    alignment: {
      vertical: "middle" as const,
      horizontal: "right" as const,
      wrapText: false,
    },
    numFmt: "#,##0.00",
  };

  let currentRow = 1;

  // Add title if provided
  if (title) {
    worksheet.mergeCells(1, 1, 1, columnDefinitions.length);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = title;
    titleCell.style = {
      font: {
        bold: true,
        size: 16,
        color: { argb: "FF000000" },
      },
      alignment: {
        vertical: "middle" as const,
        horizontal: "center" as const,
      },
    };
    worksheet.getRow(1).height = 30;
    currentRow = 2;
  }

  // Process columns and build flat column list (for Excel, we don't use nested groups)
  // Maintain original order from columnDefinitions
  const flatColumns: Array<{
    def: ColumnDefinition;
    groupName?: string;
  }> = [];

  columnDefinitions.forEach((def) => {
    flatColumns.push({
      def,
      groupName: includeGroups ? def.group : undefined,
    });
  });

  // Add header row
  if (includeHeader) {
    const headerRow = worksheet.getRow(currentRow);
    let colIndex = 1;

    flatColumns.forEach(({ def }) => {
      const cell = headerRow.getCell(colIndex);
      cell.value = def.label;
      cell.style = headerStyle;
      colIndex++;
    });

    headerRow.height = 25;
    currentRow++;
  }

  // Add data rows
  data.forEach((rowData) => {
    const dataRow = worksheet.getRow(currentRow);
    let colIndex = 1;

    flatColumns.forEach(({ def }) => {
      const cell = dataRow.getCell(colIndex);
      const value = rowData[def.key];
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        cell.value = "";
        cell.style = {
          ...cellStyle,
          alignment: {
            ...cellStyle.alignment,
            horizontal:
              def.align === "left"
                ? "left"
                : def.align === "center"
                  ? "center"
                  : def.align === "right"
                    ? "right"
                    : "left",
          },
        };
        colIndex++;
        return;
      }

      const formattedValue = formatCellValue(value, def);
      cell.value = formattedValue;

      // Apply cell style based on type and alignment
      if (def.type === "number") {
        const numValue = typeof formattedValue === "number" ? formattedValue : parseFloat(String(formattedValue)) || 0;
        const decimals = def.options?.decimals ?? 2;
        
        // If prefix/suffix is needed, format as text
        if (def.options?.prefix || def.options?.suffix) {
          const prefix = def.options.prefix || "";
          const suffix = def.options.suffix || "";
          const formattedNum = new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: def.options?.showThousandsSeparator !== false,
          }).format(numValue);
          cell.value = `${prefix}${formattedNum}${suffix}`;
          cell.style = {
            ...cellStyle,
            alignment: {
              ...cellStyle.alignment,
              horizontal:
                def.align === "left"
                  ? "left"
                  : def.align === "right"
                    ? "right"
                    : "right",
            },
          };
        } else {
          // Use number format for Excel
          cell.value = numValue;
          let numFormat = "#,##0";
          if (decimals > 0) {
            numFormat = `#,##0.${"0".repeat(decimals)}`;
          }
          cell.numFmt = numFormat;
          cell.style = {
            ...numberCellStyle,
            alignment: {
              ...numberCellStyle.alignment,
              horizontal:
                def.align === "left"
                  ? "left"
                  : def.align === "right"
                    ? "right"
                    : "right",
            },
          };
        }
      } else {
        cell.style = {
          ...cellStyle,
          alignment: {
            ...cellStyle.alignment,
            horizontal:
              def.align === "left"
                ? "left"
                : def.align === "center"
                  ? "center"
                  : def.align === "right"
                    ? "right"
                    : "left",
          },
        };
      }

      colIndex++;
    });

    dataRow.height = 20;
    currentRow++;
  });

  // Auto-fit columns
  flatColumns.forEach(({ def }, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = def.width ? def.width / 7 : 15; // Convert pixels to Excel units (approx)
    if (def.width) {
      column.width = Math.max(10, Math.min(def.width / 7, 50));
    } else {
      column.width = 15;
    }
  });

  // Add summary row if needed
  if (data.length > 0 && includeSummary) {
    const summaryRow = worksheet.getRow(currentRow);
    summaryRow.height = 25;

    let colIndex = 1;
    flatColumns.forEach(({ def }) => {
      const cell = summaryRow.getCell(colIndex);
      if (def.type === "number" && def.key !== "id") {
        // Calculate sum for numeric columns
        const sum = data.reduce((acc, row) => {
          const val = row[def.key];
          const numVal = typeof val === "number" ? val : parseFloat(String(val)) || 0;
          return acc + numVal;
        }, 0);
        
        const decimals = def.options?.decimals ?? 2;
        
        // Handle prefix/suffix in summary row
        if (def.options?.prefix || def.options?.suffix) {
          const prefix = def.options.prefix || "";
          const suffix = def.options.suffix || "";
          const formattedNum = new Intl.NumberFormat("vi-VN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: def.options?.showThousandsSeparator !== false,
          }).format(sum);
          cell.value = `${prefix}${formattedNum}${suffix}`;
          cell.style = {
            ...cellStyle,
            font: { bold: true },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF2F2F2" },
            },
            alignment: {
              ...cellStyle.alignment,
              horizontal: "right",
            },
          };
        } else {
          cell.value = sum;
          let numFormat = "#,##0";
          if (decimals > 0) {
            numFormat = `#,##0.${"0".repeat(decimals)}`;
          }
          cell.numFmt = numFormat;
          cell.style = {
            ...numberCellStyle,
            font: { bold: true },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF2F2F2" },
            },
          };
        }
      } else if (colIndex === 1) {
        cell.value = "Tổng cộng";
        cell.style = {
          ...cellStyle,
          font: { bold: true },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          },
          alignment: {
            ...cellStyle.alignment,
            horizontal: "right",
          },
        };
      } else {
        cell.value = "";
        cell.style = {
          ...cellStyle,
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          },
        };
      }
      colIndex++;
    });
  }

  // Generate Excel file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


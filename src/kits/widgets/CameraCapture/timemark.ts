import moment from "moment";

export type CameraCaptureTimeMarkPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface CameraCaptureTimeMarkConfig {
  textLines?: string[];
  tokenValues?: Record<string, string | number | null | undefined>;
  showTimestamp?: boolean;
  timestampLabel?: string;
  timestampFormat?: string;
  position?: CameraCaptureTimeMarkPosition;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
  margin?: number;
  paddingX?: number;
  paddingY?: number;
  lineSpacing?: number;
  borderRadius?: number;
}

const TIMESTAMP_TOKEN = "{{timestamp}}";
const TOKEN_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const resolveLineTokens = (
  line: string,
  tokenValues: Record<string, string | number | null | undefined>,
) => {
  return line.replace(TOKEN_REGEX, (_, tokenName: string) => {
    const tokenValue = tokenValues[tokenName];
    if (tokenValue === null || tokenValue === undefined) {
      return "";
    }
    return `${tokenValue}`;
  });
};

const buildTimemarkLines = (
  config: CameraCaptureTimeMarkConfig | undefined,
  capturedAt: Date,
) => {
  const safeConfig = config ?? {};
  const timestampFormat = safeConfig.timestampFormat || "DD/MM/YYYY HH:mm:ss";
  const timestampLabel = safeConfig.timestampLabel || "Thời gian";
  const timestamp = moment(capturedAt).format(timestampFormat);
  const tokenValues = {
    ...(safeConfig.tokenValues ?? {}),
    timestamp,
  };

  const baseLines = (safeConfig.textLines ?? [])
    .map((line) => resolveLineTokens(line, tokenValues).trim())
    .filter(Boolean);

  const hasTimestampInLines = baseLines.some((line) => line.includes(timestamp));
  const shouldShowTimestamp = safeConfig.showTimestamp ?? true;

  if (shouldShowTimestamp && !hasTimestampInLines) {
    baseLines.push(`${timestampLabel}: ${timestamp}`);
  }

  return baseLines;
};

const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const clampedRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + clampedRadius, y);
  ctx.lineTo(x + width - clampedRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + clampedRadius);
  ctx.lineTo(x + width, y + height - clampedRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - clampedRadius, y + height);
  ctx.lineTo(x + clampedRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - clampedRadius);
  ctx.lineTo(x, y + clampedRadius);
  ctx.quadraticCurveTo(x, y, x + clampedRadius, y);
  ctx.closePath();
};

const loadImageFromDataUrl = (dataUrl: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không thể tải ảnh để đóng dấu thời gian"));
    image.src = dataUrl;
  });
};

const hasTimemarkConfig = (config?: CameraCaptureTimeMarkConfig) => {
  if (!config) {
    return false;
  }

  return (config.textLines?.length ?? 0) > 0 || (config.showTimestamp ?? true);
};

export const applyCameraCaptureTimeMark = async (
  sourceDataUrl: string,
  config?: CameraCaptureTimeMarkConfig,
) => {
  if (!hasTimemarkConfig(config)) {
    return sourceDataUrl;
  }

  const capturedAt = new Date();
  const lines = buildTimemarkLines(config, capturedAt);
  if (!lines.length) {
    return sourceDataUrl;
  }

  const image = await loadImageFromDataUrl(sourceDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return sourceDataUrl;
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const fontSize = config?.fontSize ?? Math.max(16, Math.round(canvas.width * 0.02));
  const fontFamily = config?.fontFamily ?? "Arial, sans-serif";
  const lineSpacing = config?.lineSpacing ?? Math.max(6, Math.round(fontSize * 0.25));
  const paddingX = config?.paddingX ?? Math.max(12, Math.round(fontSize * 0.75));
  const paddingY = config?.paddingY ?? Math.max(10, Math.round(fontSize * 0.6));
  const margin = config?.margin ?? Math.max(16, Math.round(fontSize));
  const borderRadius = config?.borderRadius ?? Math.max(8, Math.round(fontSize * 0.5));
  const textColor = config?.textColor ?? "#FFFFFF";
  const backgroundColor = config?.backgroundColor ?? "rgba(0, 0, 0, 0.6)";
  const position = config?.position ?? "bottom-left";

  ctx.font = `600 ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";

  const maxTextWidth = lines.reduce((maxWidth, line) => {
    return Math.max(maxWidth, ctx.measureText(line).width);
  }, 0);

  const lineHeight = fontSize;
  const contentHeight = lineHeight * lines.length + lineSpacing * (lines.length - 1);
  const boxWidth = maxTextWidth + paddingX * 2;
  const boxHeight = contentHeight + paddingY * 2;

  const x = position.endsWith("right") ? canvas.width - boxWidth - margin : margin;
  const y = position.startsWith("bottom") ? canvas.height - boxHeight - margin : margin;

  ctx.fillStyle = backgroundColor;
  drawRoundRect(ctx, x, y, boxWidth, boxHeight, borderRadius);
  ctx.fill();

  ctx.fillStyle = textColor;
  lines.forEach((line, lineIndex) => {
    ctx.fillText(line, x + paddingX, y + paddingY + lineIndex * (lineHeight + lineSpacing));
  });

  return canvas.toDataURL("image/jpeg", 0.95);
};

"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { css } from "@emotion/css";

export interface CaroBorderProps {
  color1?: string;
  color2?: string;
  edgeColor?: string;
  squareSize?: number; // kích thước 1 ô caro (px)
  borderRows?: number; // số hàng caro làm viền
  borderRadius?: number; // bo góc (px)
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const CaroBorder: React.FC<CaroBorderProps> = ({
  color1 = "#FFFFFF",
  color2 = "#000000",
  edgeColor = "#FFFFFF",
  squareSize = 8,
  borderRows = 2,
  borderRadius = 0,
  className,
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dùng ResizeObserver để tự vẽ lại khi thay đổi kích thước
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const C = canvas.getContext("2d");
    if (!C) return;

    const draw = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (w === 0 || h === 0) return;

      // Cập nhật kích thước canvas theo container (device pixel ratio aware)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      C.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Xoá toàn bộ
      C.clearRect(0, 0, w, h);

      // Cắt theo rounded-rect ngoài để bo góc viền đẹp
      C.save();
      createRoundedRectPath(C, 0, 0, w, h, borderRadius);
      C.clip();

      // Vẽ caro phủ toàn bộ
      for (let y = 0; y < h; y += squareSize) {
        for (let x = 0; x < w; x += squareSize) {
          const isEven = ((x / squareSize) | 0) + ((y / squareSize) | 0);
          C.fillStyle = isEven % 2 === 0 ? color1 : color2;
          C.fillRect(x, y, squareSize, squareSize);
        }
      }

      // Đục rỗng phần trong để chỉ còn lại viền
      const borderWidth = borderRows * squareSize;
      C.globalCompositeOperation = "destination-out";
      createRoundedRectPath(
        C,
        borderWidth,
        borderWidth,
        Math.max(0, w - 2 * borderWidth),
        Math.max(0, h - 2 * borderWidth),
        Math.max(0, borderRadius - Math.min(borderRadius, borderWidth) / 2),
      );
      C.fill();
      C.globalCompositeOperation = "source-over";

      // Vẽ 4 ô vuông trắng ở 4 góc
      C.fillStyle = edgeColor;
      const cornerSize = squareSize * 2;

      // Góc trên trái
      C.fillRect(0, 0, cornerSize, cornerSize);

      // Góc trên phải
      C.fillRect(w - cornerSize, 0, cornerSize, cornerSize);

      // Góc dưới trái
      C.fillRect(0, h - cornerSize, cornerSize, cornerSize);

      // Góc dưới phải
      C.fillRect(w - cornerSize, h - cornerSize, cornerSize, cornerSize);

      C.restore();
    };

    draw();

    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [color1, color2, edgeColor, squareSize, borderRows, borderRadius]);

  return (
    <div
      ref={containerRef}
      className={[sContainer, className].filter(Boolean).join(" ")}
      style={style}
    >
      <canvas ref={canvasRef} className={sCanvas} />
      <div
        className={sContent}
        style={{
          // tạo khoảng cách để border hiển thị xung quanh content
          padding: borderRows * squareSize,
          borderRadius,
        }}
      >
        {children}
      </div>
    </div>
  );
};

function createRoundedRectPath(
  C: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  C.beginPath();
  C.moveTo(x + radius, y);
  C.lineTo(x + w - radius, y);
  C.quadraticCurveTo(x + w, y, x + w, y + radius);
  C.lineTo(x + w, y + h - radius);
  C.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  C.lineTo(x + radius, y + h);
  C.quadraticCurveTo(x, y + h, x, y + h - radius);
  C.lineTo(x, y + radius);
  C.quadraticCurveTo(x, y, x + radius, y);
  C.closePath();
}

const sContainer = css`
  position: relative;
  width: 100%;
  height: 100%;
`;

const sCanvas = css`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const sContent = css`
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

export default CaroBorder;

"use client";

import React, { useRef, useEffect, useState } from "react";
import { css } from "@emotion/css";

export type tCoordinates2D = {
  x: number;
  y: number;
};

export type AnimationDirection =
  | "to-right"
  | "to-left"
  | "to-bottom"
  | "to-top"
  | "to-bottom-right"
  | "to-bottom-left"
  | "to-top-right"
  | "to-top-left";

export interface GridCanvasProps {
  backgroundColor?: string;
  gridColor?: string;
  gridSpacing?: number;
  gridWeight?: number;
  speed?: number;
  animated?: boolean;
  direction?: AnimationDirection;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  backgroundColor = "#FFFFFF", // Background color
  gridColor = "#000000", // Grid color
  gridSpacing = 20,
  gridWeight = 1,
  speed = 1,
  animated = true,
  direction = "to-bottom-right",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  // Sử dụng useRef để lưu trữ offset và animation state
  const offsetRef = useRef<tCoordinates2D>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number>();

  // Tách riêng useEffect cho animation và context setup
  useEffect(() => {
    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext("2d");
      if (renderCtx) {
        setContext(renderCtx);
      }
    }
  }, []);

  // useEffect riêng cho animation logic
  useEffect(() => {
    if (!context) return;

    const drawGrid = (C: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      const canvasWidth = C.canvas.width;
      const canvasHeight = C.canvas.height;

      // Fill background
      C.fillStyle = backgroundColor;
      C.fillRect(0, 0, canvasWidth, canvasHeight);

      // Set grid properties
      C.strokeStyle = gridColor;
      C.lineWidth = gridWeight;
      C.lineCap = "round";

      // Draw vertical lines
      const verticalLinesCount = Math.ceil(canvasWidth / gridSpacing) + 3;
      const startVerticalX = Math.floor(offsetX / gridSpacing) - 1;

      C.beginPath();
      for (let i = 0; i < verticalLinesCount; i++) {
        const x = startVerticalX + i;
        const lineX = x * gridSpacing - offsetX;

        // Only draw lines that are visible on canvas
        if (lineX >= -gridWeight && lineX <= canvasWidth + gridWeight) {
          C.moveTo(lineX, 0);
          C.lineTo(lineX, canvasHeight);
        }
      }
      C.stroke();

      // Draw horizontal lines
      const horizontalLinesCount = Math.ceil(canvasHeight / gridSpacing) + 3;
      const startHorizontalY = Math.floor(offsetY / gridSpacing) - 1;

      C.beginPath();
      for (let i = 0; i < horizontalLinesCount; i++) {
        const y = startHorizontalY + i;
        const lineY = y * gridSpacing - offsetY;

        // Only draw lines that are visible on canvas
        if (lineY >= -gridWeight && lineY <= canvasHeight + gridWeight) {
          C.moveTo(0, lineY);
          C.lineTo(canvasWidth, lineY);
        }
      }
      C.stroke();
    };

    const draw = () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawGrid(context, offsetRef.current.x, offsetRef.current.y);
      }
    };

    const updateOffset = (
      currentOffset: tCoordinates2D,
      direction: AnimationDirection,
      deltaTime: number,
    ): tCoordinates2D => {
      const moveDistance = speed * deltaTime * 0.1; // Scale down for smooth movement

      switch (direction) {
        case "to-right":
          return {
            x: currentOffset.x + moveDistance,
            y: currentOffset.y,
          };
        case "to-left":
          return {
            x: currentOffset.x - moveDistance,
            y: currentOffset.y,
          };
        case "to-bottom":
          return {
            x: currentOffset.x,
            y: currentOffset.y + moveDistance,
          };
        case "to-top":
          return {
            x: currentOffset.x,
            y: currentOffset.y - moveDistance,
          };
        case "to-bottom-right":
          return {
            x: currentOffset.x + moveDistance,
            y: currentOffset.y + moveDistance,
          };
        case "to-bottom-left":
          return {
            x: currentOffset.x - moveDistance,
            y: currentOffset.y + moveDistance,
          };
        case "to-top-right":
          return {
            x: currentOffset.x + moveDistance,
            y: currentOffset.y - moveDistance,
          };
        case "to-top-left":
          return {
            x: currentOffset.x - moveDistance,
            y: currentOffset.y - moveDistance,
          };
        default:
          return currentOffset;
      }
    };

    const render = (currentTime: number) => {
      if (context) {
        // Set canvas size only once
        if (
          context.canvas.width !== window.innerWidth ||
          context.canvas.height !== window.innerHeight
        ) {
          context.canvas.width = window.innerWidth;
          context.canvas.height = window.innerHeight;
        }

        if (animated) {
          const deltaTime = currentTime - lastTimeRef.current;
          lastTimeRef.current = currentTime;

          offsetRef.current = updateOffset(offsetRef.current, direction, deltaTime);

          // Reset offset when it gets too large to prevent overflow
          if (Math.abs(offsetRef.current.x) > gridSpacing * 2) {
            offsetRef.current.x = offsetRef.current.x % gridSpacing;
          }
          if (Math.abs(offsetRef.current.y) > gridSpacing * 2) {
            offsetRef.current.y = offsetRef.current.y % gridSpacing;
          }

          animationFrameIdRef.current = window.requestAnimationFrame(render);
        }

        draw();
      }
    };

    // Chỉ start animation nếu chưa có animation đang chạy
    if (!animationFrameIdRef.current) {
      lastTimeRef.current = performance.now();
      render(lastTimeRef.current);
    }

    return () => {
      if (animationFrameIdRef.current) {
        window.cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = undefined;
      }
    };
  }, [context, gridSpacing, gridWeight, speed, animated, direction, backgroundColor, gridColor]);

  return (
    <>
      <canvas ref={canvasRef} className={sCanvas} />
    </>
  );
};

const sCanvas = css`
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  z-index: -5;
`;

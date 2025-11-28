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

export interface LineCanvasProps {
  backgroundColor?: string;
  lineColor?: string;
  lineWidth?: number;
  lineSpacing?: number;
  speed?: number;
  animated?: boolean;
  direction?: AnimationDirection;
}

export const LineCanvas: React.FC<LineCanvasProps> = ({
  backgroundColor = "#FFFFFF", // Dark blue background
  lineColor = "#000000", // Light blue lines
  lineWidth = 2,
  lineSpacing = 20,
  speed = 1,
  animated = true,
  direction = "to-right",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D>();

  useEffect(() => {
    let animationFrameId: number;
    let offset: tCoordinates2D = { x: 0, y: 0 };
    let lastTime = 0;

    const drawLines = (C: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      const canvasWidth = C.canvas.width;
      const canvasHeight = C.canvas.height;

      // Fill background
      C.fillStyle = backgroundColor;
      C.fillRect(0, 0, canvasWidth, canvasHeight);

      // Set line properties
      C.strokeStyle = lineColor;
      C.lineWidth = lineWidth;
      C.lineCap = "round";

      // Calculate how many lines we need to cover the entire canvas with buffer
      const totalSpacing = lineWidth + lineSpacing;
      const linesCount = Math.ceil(canvasWidth / totalSpacing) + 3;

      // Start drawing from a negative offset to ensure coverage during animation
      const startX = Math.floor(offsetX / totalSpacing) - 1;

      C.beginPath();

      for (let i = 0; i < linesCount; i++) {
        const x = startX + i;
        const lineX = x * totalSpacing - offsetX;

        // Only draw lines that are visible on canvas
        if (lineX >= -lineWidth && lineX <= canvasWidth + lineWidth) {
          C.moveTo(lineX, 0);
          C.lineTo(lineX, canvasHeight);
        }
      }

      C.stroke();
    };

    const draw = () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawLines(context, offset.x, offset.y);
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
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;

          offset = updateOffset(offset, direction, deltaTime);

          // Reset offset when it gets too large to prevent overflow
          const totalSpacing = lineWidth + lineSpacing;
          if (Math.abs(offset.x) > totalSpacing * 2) {
            offset.x = offset.x % totalSpacing;
          }
          if (Math.abs(offset.y) > totalSpacing * 2) {
            offset.y = offset.y % totalSpacing;
          }

          animationFrameId = window.requestAnimationFrame(render);
        }

        draw();
      }
    };

    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext("2d");
      if (renderCtx) {
        setContext(renderCtx);
        lastTime = performance.now();
        render(lastTime);
      }
    }

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [context, backgroundColor, lineColor, lineWidth, lineSpacing, speed, animated, direction]);

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

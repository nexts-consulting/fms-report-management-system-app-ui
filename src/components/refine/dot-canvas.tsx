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

export interface DotCanvasProps {
  backgroundColor?: string;
  dotColor?: string;
  dotSize?: number;
  dotSpacing?: number;
  speed?: number;
  animated?: boolean;
  direction?: AnimationDirection;
}

export const DotCanvas: React.FC<DotCanvasProps> = ({
  backgroundColor = "#FFFFFF", // Background color
  dotColor = "#000000", // Dot color
  dotSize = 4,
  dotSpacing = 20,
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

    const drawDots = (C: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      const canvasWidth = C.canvas.width;
      const canvasHeight = C.canvas.height;

      // Fill background
      C.fillStyle = backgroundColor;
      C.fillRect(0, 0, canvasWidth, canvasHeight);

      // Set dot properties
      C.fillStyle = dotColor;

      // Calculate how many dots we need to cover the entire canvas with buffer
      const dotsX = Math.ceil(canvasWidth / dotSpacing) + 3;
      const dotsY = Math.ceil(canvasHeight / dotSpacing) + 3;

      // Start drawing from a negative offset to ensure coverage during animation
      const startX = Math.floor(offsetX / dotSpacing) - 1;
      const startY = Math.floor(offsetY / dotSpacing) - 1;

      for (let i = 0; i < dotsX; i++) {
        for (let j = 0; j < dotsY; j++) {
          const x = startX + i;
          const y = startY + j;

          // Pattern xen kẽ: hàng chẵn bắt đầu với dot, hàng lẻ bắt đầu với khoảng trống
          // Hàng chẵn (y % 2 === 0): x _ x _ x _
          // Hàng lẻ (y % 2 === 1): _ x _ x _ x
          const shouldDrawDot = (x + (y % 2)) % 2 === 0;

          if (shouldDrawDot) {
            const dotX = x * dotSpacing - offsetX;
            const dotY = y * dotSpacing - offsetY;

            // Only draw dots that are visible on canvas
            if (
              dotX >= -dotSize &&
              dotX <= canvasWidth + dotSize &&
              dotY >= -dotSize &&
              dotY <= canvasHeight + dotSize
            ) {
              C.beginPath();
              C.arc(dotX, dotY, dotSize / 2, 0, 2 * Math.PI);
              C.fill();
            }
          }
        }
      }
    };

    const draw = () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawDots(context, offsetRef.current.x, offsetRef.current.y);
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
          if (Math.abs(offsetRef.current.x) > dotSpacing * 2) {
            offsetRef.current.x = offsetRef.current.x % dotSpacing;
          }
          if (Math.abs(offsetRef.current.y) > dotSpacing * 2) {
            offsetRef.current.y = offsetRef.current.y % dotSpacing;
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
  }, [context, dotSize, dotSpacing, speed, animated, direction, backgroundColor, dotColor]);

  return (
    <>
      <canvas ref={canvasRef} className={sCanvas} />
    </>
  );
};

const sCanvas = css`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  z-index: -5;
`;

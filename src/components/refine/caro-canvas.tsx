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

export interface CaroCanvasProps {
  color1?: string;
  color2?: string;
  squareSize?: number;
  speed?: number;
  animated?: boolean;
  direction?: AnimationDirection;
}

export const CaroCanvas: React.FC<CaroCanvasProps> = ({
  color1 = "#FFFFFF", // Dark blue
  color2 = "#000000", // Light blue
  squareSize = 50,
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

    const drawCaro = (C: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      const canvasWidth = C.canvas.width;
      const canvasHeight = C.canvas.height;

      // Calculate how many squares we need to cover the entire canvas with buffer
      const squaresX = Math.ceil(canvasWidth / squareSize) + 3;
      const squaresY = Math.ceil(canvasHeight / squareSize) + 3;

      // Start drawing from a negative offset to ensure coverage during animation
      const startX = Math.floor(offsetX / squareSize) - 1;
      const startY = Math.floor(offsetY / squareSize) - 1;

      for (let i = 0; i < squaresX; i++) {
        for (let j = 0; j < squaresY; j++) {
          const x = startX + i;
          const y = startY + j;

          // Determine color based on checkerboard pattern
          const isEven = (x + y) % 2 === 0;
          C.fillStyle = isEven ? color1 : color2;

          // Draw square with proper offset
          C.fillRect(x * squareSize - offsetX, y * squareSize - offsetY, squareSize, squareSize);
        }
      }
    };

    const draw = () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawCaro(context, offsetRef.current.x, offsetRef.current.y);
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
          if (Math.abs(offsetRef.current.x) > squareSize * 2) {
            offsetRef.current.x = offsetRef.current.x % squareSize;
          }
          if (Math.abs(offsetRef.current.y) > squareSize * 2) {
            offsetRef.current.y = offsetRef.current.y % squareSize;
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
  }, [context, squareSize, speed, animated, direction, color1, color2]); // Thêm color1, color2 vào dependency để redraw khi color thay đổi

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

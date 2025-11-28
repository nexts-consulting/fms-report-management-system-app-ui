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

export interface DiagonalCanvasProps {
  color1?: string;
  color2?: string;
  size?: number;
  angle?: number; // Angle in degrees (default 45 for diagonal)
  speed?: number;
  animated?: boolean;
  direction?: AnimationDirection;
}

export const DiagonalCanvas: React.FC<DiagonalCanvasProps> = ({
  color1 = "#FFFFFF", // First color
  color2 = "#000000", // Second color
  size = 20,
  angle = 45, // 45 degrees for diagonal
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

    const drawDiagonalPattern = (C: CanvasRenderingContext2D, offsetX: number, offsetY: number) => {
      const canvasWidth = C.canvas.width;
      const canvasHeight = C.canvas.height;

      // Convert angle to radians
      const angleRad = (angle * Math.PI) / 180;

      // We rotate the context, then draw vertical stripes spanning the rotated bounds
      // Compute the diagonal size to fully cover the canvas after rotation
      const coverSize = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);

      // Normalize offset along the stripe direction (x-axis after rotation)
      const stripeWidth = size;

      // Prepare to draw in rotated space
      C.save();
      // Move origin to center to avoid clipping after rotation
      C.translate(canvasWidth / 2, canvasHeight / 2);
      C.rotate(angleRad);

      // After rotation, we'll draw a series of vertical rectangles that cover the
      // entire height of the rotated canvas (-coverSize/2 .. coverSize/2)
      const startX = Math.floor((-coverSize / 2 - offsetX) / stripeWidth) - 1;
      const stripesCount = Math.ceil(coverSize / stripeWidth) + 4;

      for (let i = 0; i < stripesCount; i++) {
        const index = startX + i;
        const x = index * stripeWidth + offsetX;
        // Alternate colors by index
        const isEven = index % 2 === 0;
        C.fillStyle = isEven ? color1 : color2;
        C.fillRect(x, -coverSize / 2, stripeWidth, coverSize);
      }

      // Restore back to normal space
      C.restore();
    };

    const draw = () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawDiagonalPattern(context, offset.x, offset.y);
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
            x: currentOffset.x + moveDistance,
            y: currentOffset.y,
          };
        case "to-top":
          return {
            x: currentOffset.x - moveDistance,
            y: currentOffset.y,
          };
        case "to-bottom-right":
          return {
            x: currentOffset.x + moveDistance,
            y: currentOffset.y,
          };
        case "to-bottom-left":
          return {
            x: currentOffset.x - moveDistance,
            y: currentOffset.y,
          };
        case "to-top-right":
          return {
            x: currentOffset.x + moveDistance,
            y: currentOffset.y,
          };
        case "to-top-left":
          return {
            x: currentOffset.x - moveDistance,
            y: currentOffset.y,
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
          const effectiveSpacing = size;

          if (Math.abs(offset.x) > effectiveSpacing * 2) {
            offset.x = offset.x % effectiveSpacing;
          }
          // offset.y is unused in the new logic but keep it bounded
          if (Math.abs(offset.y) > effectiveSpacing * 2) {
            offset.y = offset.y % effectiveSpacing;
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
  }, [context, color1, color2, size, angle, speed, animated, direction]);

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

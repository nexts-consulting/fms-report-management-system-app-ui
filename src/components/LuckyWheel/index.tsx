/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import React, { useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { getRandomIntRange } from "@/utils";
import { useTriggerRender } from "@/hooks/use-trigger-render";
import Image from "next/image";

export interface IGiftConfig {
  gift: {
    id: string;
    code: string;
    label: string;
    image_url: string;
    color?: string;
    ratio: number;
  };
  order?: number;
  quantity?: number;
  stock?: number;
}

const wheelConfig = {
  WHEEL_BORDER: 20,
  WHEEL_COLORS: ["#ffffff", "#e2e2e2"],
  WHEEL_INNER_BORDER: 12,
  WHEEL_INNER_BORDER_COLOR: "#cfcfcf",
  NUM_BULBS: 8,
  BLULB_SIZE: 16,
  BULB_COLORS: ["#e94545", "#b00202"],
  BUTTON_SIZE: 90,
  BUTTON_COLORS: ["#cfcfcf", "#e2e2e2"],
  PIECE_COLORS: ["#0030d8", "#50cefb"],
};

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

interface LuckyWheelProps {
  giftsConfig: IGiftConfig[];
  onPickedGift?: (gift: IGiftConfig) => void;
  selectedGiftCode?: string;
  autoStart?: boolean;
  clone?: number;
  disableSpin?: boolean;
  textDistanceFromCenter?: number;
}

export const LuckyWheel = (props: LuckyWheelProps) => {
  const {
    giftsConfig,
    onPickedGift,
    selectedGiftCode,
    autoStart = false,
    clone = 1,
    disableSpin = false,
    textDistanceFromCenter = 20,
  } = props;

  // State để track các hình ảnh load thất bại
  const [failedImages, setFailedImages] = React.useState<Set<string>>(new Set());

  const clonedGiftsConfig = React.useMemo(() => {
    const result: IGiftConfig[] = [];
    for (let i = 0; i < clone; i++) {
      giftsConfig.forEach((gift) => {
        result.push({
          ...gift,
          gift: {
            ...gift.gift,
            id: `${gift.gift.id}_clone_${i}`,
          },
        });
      });
    }
    return result;
  }, [giftsConfig, clone]);

  const wheelContainerRef = React.useRef<HTMLDivElement>(null);
  const [wheelSize, setWheelSize] = React.useState(0);

  const giftIconSize = React.useMemo(
    () => Math.min(wheelSize / clonedGiftsConfig.length + 15, 120),
    [wheelSize, clonedGiftsConfig],
  );

  useTriggerRender(200);

  const [isAnimationStart, setIsAnimationStart] = React.useState(false);
  const rotateControl = useAnimation();
  const arrowControls = useAnimation();

  const rotate = useMotionValue(0);
  const endValue = useMotionValue(0);

  interface PieChartData {
    id: any;
    start_degree: number;
    end_degree: number;
  }

  const pieChartData = React.useMemo<PieChartData[]>(() => {
    const degreePerGift = 360 / clonedGiftsConfig.length;
    return clonedGiftsConfig.map((giftConfig, index) => {
      const start_degree = index * degreePerGift;
      const end_degree = start_degree + degreePerGift;

      return {
        id: giftConfig.gift.id,
        start_degree,
        end_degree,
      };
    });
  }, [clonedGiftsConfig]);

  React.useEffect(() => {
    if (selectedGiftCode && !isAnimationStart && autoStart) {
      const giftsWithSameCode = clonedGiftsConfig.filter(
        (gift) => gift.gift.code === selectedGiftCode,
      );
      if (giftsWithSameCode.length > 0) {
        const randomIndex = Math.floor(Math.random() * giftsWithSameCode.length);
        startSpinning(giftsWithSameCode[randomIndex]);
      }
    }
  }, [selectedGiftCode, autoStart, clonedGiftsConfig]);

  const startSpinning = (gift: IGiftConfig) => {
    const randomDegree = getRandomDegreeForGift(gift.gift)!;
    const spinCount = getRandomIntRange(10, 20);
    const offset = 360 - randomDegree;
    const duration = getRandomIntRange(10, 15);
    endValue.set(spinCount * 360 + offset);

    rotate.set(0);
    setIsAnimationStart(true);

    (async () => {
      rotateControl.start({
        rotate: endValue.get(),
        transition: {
          type: "tween",
          duration: duration,
          ease: [0.5, 0.1, 0.15, 1],
        },
      });

      setTimeout(
        () => {
          rotateControl.start({
            rotate: endValue.get(),
            transition: { type: "tween", duration: 0 },
          });
          setIsAnimationStart(false);
          onPickedGift && onPickedGift(gift);
        },
        duration * 1000 + 300,
      );
    })();
  };

  const handleSpin = () => {
    if (disableSpin || isAnimationStart) {
      return;
    }

    if (selectedGiftCode) {
      const giftsWithSameCode = clonedGiftsConfig.filter(
        (gift) => gift.gift.code === selectedGiftCode,
      );
      if (giftsWithSameCode.length > 0 && !isAnimationStart) {
        const randomIndex = Math.floor(Math.random() * giftsWithSameCode.length);
        startSpinning(giftsWithSameCode[randomIndex]);
      }
      return;
    }
  };

  const getRandomDegreeForGift = (gift: any) => {
    const segmentsWithSameCode = pieChartData.filter(
      (data) => clonedGiftsConfig.find((g) => g.gift.id === data.id)?.gift.code === gift.code,
    );

    if (segmentsWithSameCode.length === 0) {
      return 5;
    }

    const randomIndex = Math.floor(Math.random() * segmentsWithSameCode.length);
    const segment = segmentsWithSameCode[randomIndex];

    const { start_degree, end_degree } = segment;
    const margin = 5;
    const maxRetries = 10;

    if (end_degree - start_degree <= 2 * margin) {
      return start_degree + margin;
    }

    for (let i = 0; i < maxRetries; i++) {
      const randomDegree =
        Math.random() * (end_degree - start_degree - 2 * margin) + start_degree + margin;

      if (randomDegree > start_degree + margin && randomDegree < end_degree - margin) {
        return randomDegree;
      }
    }

    return start_degree + margin;
  };

  React.useEffect(() => {
    const updateWheelSize = () => {
      if (wheelContainerRef.current) {
        const { width } = wheelContainerRef.current.getBoundingClientRect();
        setWheelSize(width);
      }
    };

    updateWheelSize();
    window.addEventListener("resize", updateWheelSize);

    return () => window.removeEventListener("resize", updateWheelSize);
  }, []);

  useEffect(() => {
    return () => {
      setIsAnimationStart(false);
      rotateControl.stop();
      arrowControls.stop();
    };
  }, []);

  const renderSegments = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = React.useRef<CanvasRenderingContext2D | null>(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (canvasRef.current && wheelSize > 0) {
        canvasRef.current.width = wheelSize;
        canvasRef.current.height = wheelSize;
        ctx.current = canvasRef.current.getContext("2d");
        const context = ctx.current;

        if (context) {
          const segmentAngle = 360 / clonedGiftsConfig.length;
          const radius = wheelSize / 2;
          const centerX = radius;
          const centerY = radius;

          clonedGiftsConfig.forEach((giftConfig, i) => {
            const startAngle = degreesToRadians(i * segmentAngle - 90);
            const endAngle = degreesToRadians((i + 1) * segmentAngle - 90);

            context.save();
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius, startAngle, endAngle, false);
            context.closePath();

            const gradient = context.createRadialGradient(
              centerX,
              centerY,
              0,
              centerX,
              centerY,
              radius,
            );

            const baseColor =
              giftConfig.gift.color ||
              (i % 2 ? wheelConfig.PIECE_COLORS[0] : wheelConfig.PIECE_COLORS[1]);

            gradient.addColorStop(0, lightenDarkenColor(baseColor, 50));
            gradient.addColorStop(0.8, baseColor);
            gradient.addColorStop(1, lightenDarkenColor(baseColor, -50));

            context.fillStyle = gradient;
            context.fill();

            context.restore();
          });
        }
      }
    }, [wheelSize, clonedGiftsConfig, giftIconSize]);

    return <canvas ref={canvasRef} className="z-1 absolute" />;
  };

  const lightenDarkenColor = (col: string, amt: number) => {
    let usePound = false;
    if (col[0] === "#") {
      col = col.slice(1);
      usePound = true;
    }

    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;

    r = Math.min(Math.max(0, r), 255);
    g = Math.min(Math.max(0, g), 255);
    b = Math.min(Math.max(0, b), 255);

    return (usePound ? "#" : "") + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1 }}
        transition={{ type: "spring" }}
        className="fixed left-0 right-0 top-[10%] z-[100] mx-auto flex h-full w-screen min-w-[360px] max-w-[640px] flex-1 select-none flex-col items-center justify-center overflow-hidden px-3"
      >
        <div
          ref={wheelContainerRef}
          className="relative aspect-square h-auto w-full"
          css={css`
            position: relative;
            background-image: conic-gradient(
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[0], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[0], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[0], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[1], 0)},
              ${lightenDarkenColor(wheelConfig.WHEEL_COLORS[0], 0)}
            );
            border-radius: 50%;
            -moz-border-radius: 50%;
            -webkit-outline-radius: 50%;
            box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.1);
            &::before {
              content: "";
              inset: 0;
              border-radius: 50%;
              -moz-border-radius: 50%;
              -moz-outline-radius: 50%;

              position: absolute;
              opacity: 0.1;
              user-select: none;
              pointer-events: none;
            }
            &::after {
              content: "";
              inset: 0;
              border-radius: 50%;
              -moz-border-radius: 50%;
              -moz-outline-radius: 50%;
              position: absolute;
              opacity: 0.05;
              user-select: none;
              pointer-events: none;
            }
          `}
        >
          <div className="absolute inset-0 z-[-1] aspect-square w-full scale-[120%] rounded-full bg-white/10" />
          <div className="absolute inset-0 z-[-2] aspect-square w-full scale-[130%] rounded-full bg-white/10" />

          <div className="h-full w-full scale-[0.82]">
            <motion.div
              style={{ rotate }}
              animate={rotateControl}
              css={css`
                z-index: 5;
                position: relative;
                height: ${wheelSize}px;
                width: ${wheelSize}px;
                border-radius: 50%;
                overflow: hidden;
                transition: cubic-bezier(0.19, 1, 0.22, 1);
                background-color: #ffffff;
                box-shadow: 0 0 0 ${wheelConfig.WHEEL_INNER_BORDER}px
                  ${wheelConfig.WHEEL_INNER_BORDER_COLOR};
              `}
            >
              {renderSegments()}
              {clonedGiftsConfig.map((giftConfig, index) => {
                const segmentAngle = 360 / clonedGiftsConfig.length;
                const angleInRadians = degreesToRadians(
                  (index + 1) * segmentAngle - segmentAngle / 2 - 90,
                );
                const radius = wheelSize / 2 - giftIconSize + textDistanceFromCenter;
                const x = radius * Math.cos(angleInRadians) + wheelSize / 2 - giftIconSize / 2;
                const y = radius * Math.sin(angleInRadians) + wheelSize / 2 - giftIconSize / 2;

                return (
                  <div
                    key={giftConfig.gift.id}
                    css={css`
                      position: absolute;
                      z-index: 15;
                      width: ${giftIconSize}px;
                      height: ${giftIconSize}px;
                      left: ${x}px;
                      top: ${y}px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      transform: rotate(${(index + 1) * segmentAngle}deg);
                      transform-origin: center;
                    `}
                  >
                    <div
                      css={css`
                        transform: rotate(${-segmentAngle / 2}deg);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                      `}
                    >
                      {giftConfig.gift.image_url && !failedImages.has(giftConfig.gift.id) ? (
                        <Image
                          src={giftConfig.gift.image_url}
                          alt={`Gift ${index + 1}`}
                          className="h-full w-full object-contain"
                          width={500}
                          height={500}
                          quality={100}
                          loading="eager"
                          priority={true}
                          onError={() => {
                            // Đánh dấu hình ảnh này đã load thất bại
                            setFailedImages((prev) => new Set(prev).add(giftConfig.gift.id));
                          }}
                        />
                      ) : null}
                      {/* Hiển thị text nếu không có hình ảnh hoặc hình ảnh load thất bại */}
                      <div
                        css={css`
                          position: ${giftConfig.gift.image_url &&
                          !failedImages.has(giftConfig.gift.id)
                            ? "absolute"
                            : "relative"};
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          width: 100%;
                          height: 100%;
                          color: white;
                          font-weight: bold;
                          font-size: ${Math.max(giftIconSize * 0.15, 16)}px;
                          text-align: center;
                          line-height: 1.2;
                          padding: 4px;
                          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                          background-color: ${giftConfig.gift.image_url &&
                          !failedImages.has(giftConfig.gift.id)
                            ? "rgba(0, 0, 0, 0.6)"
                            : "transparent"};
                          border-radius: ${giftConfig.gift.image_url &&
                          !failedImages.has(giftConfig.gift.id)
                            ? "4px"
                            : "0"};
                          opacity: ${giftConfig.gift.image_url &&
                          !failedImages.has(giftConfig.gift.id)
                            ? "0"
                            : "1"};
                          transition: opacity 0.3s ease;
                          &:hover {
                            opacity: 1;
                          }
                        `}
                        onMouseEnter={(e) => {
                          if (giftConfig.gift.image_url && !failedImages.has(giftConfig.gift.id)) {
                            (e.target as HTMLElement).style.opacity = "1";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (giftConfig.gift.image_url && !failedImages.has(giftConfig.gift.id)) {
                            (e.target as HTMLElement).style.opacity = "0";
                          }
                        }}
                      >
                        {giftConfig.gift.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            {/* arrow */}
            <div
              css={css`
                position: absolute;
                z-index: 20;
                left: 50%;
                top: 50%;
                width: ${wheelConfig.BUTTON_SIZE}px;
                height: ${wheelConfig.BUTTON_SIZE}px;
                transform: translate(-50%, -50%);
              `}
            >
              <button
                css={css`
                  width: 100%;
                  height: 100%;
                  position: relative;
                  z-index: 5;
                  padding: ${wheelConfig.BUTTON_SIZE / 10}px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                  background-image: conic-gradient(
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[0], 0)},
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], -10)},
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], -10)},
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[0], 0)},
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], -10)},
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], -10)},
                    ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[0], 0)}
                  );
                  cursor: pointer;
                  &::before {
                    content: "";
                    inset: 0;
                    border-radius: 50%;
                    box-shadow: 0 0 0 50px white;
                    position: absolute;
                    opacity: 0.2;
                  }
                `}
                onClick={handleSpin}
              >
                <div
                  css={css`
                    width: 100%;
                    height: 100%;
                    flex-grow: 1;
                    background-color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: uppercase;
                    background-image: radial-gradient(
                      ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[0], 25)},
                      ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], 25)}
                    );
                  `}
                />
              </button>

              <div
                css={css`
                  position: absolute;
                  z-index: 1;
                  width: ${wheelConfig.BUTTON_SIZE / 1.8}px;
                  height: ${wheelConfig.BUTTON_SIZE / 1.5}px;
                  top: ${-wheelConfig.BUTTON_SIZE / 4 + 10}px;
                  left: ${wheelConfig.BUTTON_SIZE / 2}px;
                  transform: translate(-50%, -50%);
                `}
              >
                <motion.div
                  css={css`
                    position: relative;
                    width: 100%;
                    height: 100%;
                    clip-path: polygon(50% 0, 100% 100%, 0 100%);
                    background-color: #fff;
                    background-image: linear-gradient(
                      to left,
                      ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], -25)},
                      ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[0], 25)},
                      ${lightenDarkenColor(wheelConfig.BUTTON_COLORS[1], -25)}
                    );
                    transform-origin: center bottom;
                  `}
                  animate={arrowControls}
                />
              </div>
            </div>

            {/* blurb */}
            {/* <div
              css={css`
                z-index: 1;
                position: absolute;
                inset: 0;
                transform-origin: center center;
                user-select: none;
                pointer-events: none;
              `}
            >
              {Array.from({ length: wheelConfig.NUM_BULBS }).map((_, index) => (
                <div
                  key={index}
                  css={css`
                    top: calc(50% - ${wheelConfig.BLULB_SIZE / 2}px);
                    left: calc(50% - ${wheelConfig.BLULB_SIZE / 2}px);
                    position: absolute;
                    width: ${wheelConfig.BLULB_SIZE}px;
                    height: ${wheelConfig.BLULB_SIZE}px;
                    border: 1px #55555555 solid;
                    border-radius: 50%;
                    background-image: radial-gradient(
                      ${lightenDarkenColor(wheelConfig.BULB_COLORS[0], 0)},
                      ${lightenDarkenColor(wheelConfig.BULB_COLORS[1], 0)}
                    );
                    box-shadow: 0 0px 25px ${lightenDarkenColor(wheelConfig.BULB_COLORS[0], 0)};
                    transform: rotate(${(index * 360) / wheelConfig.NUM_BULBS}deg)
                      translate(
                        ${(wheelSize +
                          wheelConfig.WHEEL_BORDER * 2 +
                          +wheelConfig.WHEEL_INNER_BORDER * 2) /
                          2 -
                        wheelConfig.WHEEL_BORDER / 2}px
                      );
                    transform-origin: center center;
                    animation: ${keyframes`
                      0%, 100% {
                        opacity: 1;
                        box-shadow: 0 0px 25px ${lightenDarkenColor(wheelConfig.BULB_COLORS[0], 25)};
                      }
                      50% {
                        opacity: 0.5;
                        box-shadow: 0 0px 50px ${lightenDarkenColor(wheelConfig.BULB_COLORS[1], 25)};
                      }
                    `} 1s infinite;
                    animation-delay: ${index * 0.1}s;
                    user-select: none;
                    pointer-events: none;
                  `}
                />
              ))}
            </div> */}
          </div>
        </div>
      </motion.div>
    </>
  );
};

import React from "react";

export interface AnimatedEllipsisProps {
  className?: string;
  speed?: number;
}

export const AnimatedEllipsis: React.FC<AnimatedEllipsisProps> = ({ className, speed = 500 }) => {
  const [ellipsis, setEllipsis] = React.useState("");

  React.useEffect(() => {
    const interval = setInterval(() => {
      setEllipsis((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return <span className={className}>{ellipsis}</span>;
};

import React from "react";

export const useTriggerRender = (wait: number = 200) => {
  const [, setState] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setState((prev) => prev + 1);
    }, wait);

    return () => clearTimeout(timer);
  }, [wait]);

  return null;
};

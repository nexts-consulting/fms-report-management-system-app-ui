import moment from "moment";
import React from "react";
import { CommonUtil } from "../utils";

interface UseTickOptions {
  unit?: "second" | "minute" | "hour";
  minInterval?: number; // Minimum interval in milliseconds
  debug?: boolean; // Enable debug logging
}

interface TickControls {
  on: () => void;
  off: () => void;
}

export const useTick = (options: UseTickOptions = {}): [moment.Moment, TickControls] => {
  const { unit = "minute", minInterval = 100, debug = false } = options;

  const tickIdRef = React.useRef(CommonUtil.nanoid("alpha", 5));
  const [now, setNow] = React.useState(moment());
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const lastTickRef = React.useRef<number>(Date.now());
  const isActiveRef = React.useRef(true);

  const getNextTickTime = () => {
    const current = moment();
    let next: moment.Moment;

    switch (unit) {
      case "second":
        next = moment().startOf("second").add(1, "second");
        break;
      case "minute":
        next = moment().startOf("minute").add(1, "minute");
        break;
      case "hour":
        next = moment().startOf("hour").add(1, "hour");
        break;
      default:
        next = moment().startOf("minute").add(1, "minute");
    }

    return next.diff(current);
  };

  const scheduleNextTick = () => {
    if (!isActiveRef.current) return;

    const timeUntilNextTick = getNextTickTime();
    const currentTime = Date.now();
    const timeSinceLastTick = currentTime - lastTickRef.current;

    // Ensure we don't tick too frequently
    const delay = Math.max(timeUntilNextTick, minInterval - timeSinceLastTick);

    if (debug) {
      console.log(
        `[useTick] ${tickIdRef.current} - Next tick in ${delay}ms (unit: ${unit}, minInterval: ${minInterval}ms)`,
      );
      console.log(
        `[useTick] ${tickIdRef.current} - Current time: ${moment().format("HH:mm:ss.SSS")}`,
      );
    }

    timeoutRef.current = setTimeout(() => {
      if (!isActiveRef.current) return;

      lastTickRef.current = Date.now();
      const newTime = moment();
      setNow(newTime);

      if (debug) {
        console.log(`[useTick] ${tickIdRef.current} - Tick at ${newTime.format("HH:mm:ss.SSS")}`);
        console.log(
          `[useTick] ${tickIdRef.current} - Time since last tick: ${Date.now() - lastTickRef.current}ms`,
        );
      }

      scheduleNextTick();
    }, delay);
  };

  const controls: TickControls = {
    on: () => {
      if (debug) {
        console.log(`[useTick] ${tickIdRef.current} - Turning ON`);
      }
      isActiveRef.current = true;
      scheduleNextTick();
    },
    off: () => {
      if (debug) {
        console.warn(`[useTick] ${tickIdRef.current} - Turning OFF`);
      }
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        if (debug) {
          console.warn(`[useTick] ${tickIdRef.current} - Cleanup: cleared timeout`);
        }
      }
    },
  };

  React.useEffect(() => {
    if (debug) {
      console.warn(
        `[useTick] ${tickIdRef.current} - Starting tick with unit: ${unit}, minInterval: ${minInterval}ms`,
      );
    }

    scheduleNextTick();

    return () => {
      controls.off();
    };
  }, [unit, minInterval, debug]);

  return [now, controls];
};

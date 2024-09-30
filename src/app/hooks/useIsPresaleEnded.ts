import { useEffect, useRef, useState } from "react";
import { endOfPresaleDate } from "../utils/constants";

export const useIsPresaleEnded = () => {
  const [isEnded, setIsEnded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (endOfPresaleDate.getTime() < new Date().getTime()) {
        setIsEnded(true);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isEnded) {
      clearInterval(timerRef.current);
    }
  }, [isEnded]);

  return isEnded;
};

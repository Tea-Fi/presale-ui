import { FC } from "react";
import { cn } from "../../utils/cn";

type Props = {
  max?: number;
  value?: number;
  min?: number;
  className?: string;
  reverse?: boolean;
};

export const Progress: FC<Props> = ({
  max,
  value,
  min,
  className,
  reverse,
}) => {
  const ONE_HUNDRED_PERCENTS = 100;
  const MAX = max ?? ONE_HUNDRED_PERCENTS;
  const MIN = min ?? 0;
  const CURRENT = Math.max(Math.min(value ?? 0, MAX), MIN);
  const currentInPerc = Math.min(((CURRENT - MIN) / (MAX - MIN)) * 100, 100);
  const Childdiv = {
    transition: "0.2s",
    width: `${reverse ? ONE_HUNDRED_PERCENTS - currentInPerc : currentInPerc}%`,
  };

  return (
    <div
      className={cn(
        "h-3 rounded-full overflow-hidden bg-loader-parent inline-flex",
        reverse && "flex-row-reverse",
        className,
      )}
    >
      <div
        className={`h-full rounded-r-full bg-loader-child`}
        style={Childdiv}
      ></div>
    </div>
  );
};

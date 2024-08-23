import { FC } from "react";
import { cn } from "../../utils/cn";

type Props = {
  max?: number;
  value?: number;
  className?: string;
};

export const Progress: FC<Props> = ({ max, value, className }) => {
  const ONE_HUNDRED_PERCENTS = 100;
  const MAX = max ?? ONE_HUNDRED_PERCENTS;
  const CURRENT = value ?? 0;

  const currentInPerc =
    max !== ONE_HUNDRED_PERCENTS
      ? (CURRENT / MAX) * ONE_HUNDRED_PERCENTS
      : CURRENT;

  const Childdiv = {
    transition: "0.2s",
    width: `${currentInPerc >= MAX ? MAX : currentInPerc}%`,
  };

  return (
    <div
      className={cn(
        "w-full h-3 rounded-full overflow-hidden bg-loader-parent inline-flex flex-row-reverse",
        className,
      )}
    >
      <div
        className={`h-full rounded-full bg-loader-child`}
        style={Childdiv}
      ></div>
    </div>
  );
};

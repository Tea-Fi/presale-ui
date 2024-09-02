import { FC } from "react";
import { cn } from "../../utils/cn";

type Props = {
  max?: number;
  value?: number;
  className?: string;
  reverse?: boolean;
};

export const Progress: FC<Props> = ({ max, value, className, reverse }) => {
  const ONE_HUNDRED_PERCENTS = 100;
  const MAX = max ?? ONE_HUNDRED_PERCENTS;
  const CURRENT = value ?? 0;
  const currentInPerc = Math.min((CURRENT / MAX) * 100, 100);

  const Childdiv = {
    transition: "0.2s",
    width: `${currentInPerc >= MAX ? MAX : currentInPerc}%`,
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
        className={`h-full rounded-full bg-loader-child`}
        style={Childdiv}
      ></div>
    </div>
  );
};

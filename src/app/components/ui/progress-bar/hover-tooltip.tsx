// ProgressBarItem.tsx
import React from "react";

interface HoverTooltipProps {
  isVisible: boolean;
  percentage: number;
  leftOffset: number;
}

const HoverTooltip: React.FC<HoverTooltipProps> = ({ isVisible, percentage, leftOffset }) => {
  if (!isVisible) return null;

  return (
    <div
      className="relative -top-4 rounded-md text-xs z-30"
      style={{ width: `${percentage}%`, left: `${leftOffset}px`, maxWidth: "100%" }}
    >
      <div className="absolute right-0">{percentage.toFixed(2)}%</div>
    </div>
  );
};

export default HoverTooltip;

// ProgressBar.tsx
import React, { useState } from "react";
import HoverTooltip from "./hover-tooltip";
import ProgressBarItem from "./progress-bar-item";

interface ProgressBarProps {
  value1: number;
  value2?: number;
  maxValue: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value1,
  value2,
  maxValue,
}) => {
  const [isHoveringValue1, setIsHoveringValue1] = useState(false);
  const [isHoveringValue2, setIsHoveringValue2] = useState(false);

  const value1Percentage = value1 ? (value1 / maxValue) * 100 : 0;
  const value2Percentage = value2 ? (value2 / maxValue) * 100 : 0;

  return (
    <div className="relative w-full mb-10" title={`Max Value: ${maxValue}`}>
      <HoverTooltip
        isVisible={isHoveringValue1}
        percentage={value1Percentage}
        leftOffset={0}
      />
      <HoverTooltip
        isVisible={isHoveringValue2}
        percentage={value2Percentage}
        leftOffset={value1Percentage}
      />
      <div className="h-4 relative bg-[#222222] rounded-full z-0 overflow-hidden">
        <ProgressBarItem
          className="z-20"
          percentage={value1Percentage}
          color="#f716a2"
          title={`Value 1: ${value1}`}
          onHoverChange={setIsHoveringValue1}
        />
        <ProgressBarItem
          className="z-10"
          percentage={value2Percentage}
          color="#3a0c2a"
          title={`Value 2: ${value2}`}
          onHoverChange={setIsHoveringValue2}
        />

      </div>
    </div>
  );
};

export default ProgressBar;

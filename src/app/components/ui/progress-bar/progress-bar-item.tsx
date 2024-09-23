import { cn } from "../../../utils";

interface ProgressBarItemProps {
  className?: string;
  percentage: number;
  color: string;
  title: string;
  onHoverChange: (isHovering: boolean) => void;
}

const ProgressBarItem: React.FC<ProgressBarItemProps> = ({
  className,
  percentage,
  color,
  title,
  onHoverChange,
}) => {
  return (
    <div
      className={cn("absolute h-full", className)}
      style={{ width: `${percentage}%`, backgroundColor: color }}
      title={title}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    />
  );
};

export default ProgressBarItem;

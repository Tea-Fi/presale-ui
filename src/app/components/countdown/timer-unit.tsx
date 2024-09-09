import { cn } from "../../utils";

interface TimerUnitProps {
  className?: string;
  value: string | number;
  endDots?: boolean;
}
const TimerUnit = ({ className, value, endDots }: TimerUnitProps) => {
  const baseClasses =
    " text-center whitespace-nowrap flex justify-center items-center text-white font-extrabold rounded-lg bg-[#3a0c2a] mx-2 p-4 text-2xl md:text-4xl";

  return (
    <>
      <div className={cn(baseClasses, className)}>{value}</div>
      {endDots && (
        <div className={cn("text-white font-black text-2xl md:text-4xl")}>
          :
        </div>
      )}
    </>
  );
};

export default TimerUnit;

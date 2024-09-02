import { cn } from "../../utils";

interface TimerUnitProps {
  value: string | number;
  endDots?: boolean;
}
const TimerUnit = ({ value, endDots }: TimerUnitProps) => {
  const baseClasses =
    " text-center whitespace-nowrap flex justify-center items-center text-white font-extrabold rounded-lg bg-[#3a0c2a] mx-2 p-4 text-2xl md:text-4xl w-16 md:w-24";

  return (
    <>
      <div className={cn(baseClasses)}>{value}</div>
      {endDots && (
        <div className={cn("text-white font-black text-2xl md:text-4xl")}>
          :
        </div>
      )}
    </>
  );
};

export default TimerUnit;

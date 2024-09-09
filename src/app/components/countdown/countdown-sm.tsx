import Countdown from "react-countdown";
import { cn } from "../../utils/index.ts";
import { useCountdownStore } from "../../state/countdown.store.ts";
import TimerUnit from "./timer-unit.tsx";
import { endOfPresaleDate } from "../../utils/constants.ts";

interface CountdownProps {
  className?: string;
  centered: boolean;
}
export const CountdownSmall = ({ className, centered }: CountdownProps) => {
  const { setFinished } = useCountdownStore();

  const TimerCompletion = () => (
    <span className="text-white">Presale countdown has ended</span>
  );

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }) => {
    if (completed) {
      return <TimerCompletion />;
    } else {
      // Render a countdown
      const d = days;
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;

      return (
        <div
          className={cn(
            className,
            "flex mb-4",
            centered && "items-center justify-center",
          )}
        >
          <TimerUnit value={`${d} D`} />
          <TimerUnit value={h} endDots />
          <TimerUnit value={m} endDots />
          <TimerUnit value={s} />
        </div>
      );
    }
  };

  return (
    <Countdown
      date={endOfPresaleDate}
      intervalDelay={0}
      precision={3}
      renderer={renderer}
      onComplete={() => setFinished(true)}
    />
  );
};

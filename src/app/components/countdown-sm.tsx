import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import Countdown from "react-countdown";
import { cn } from "../utils";
import { useCountdownStore } from "../state/countdown.store.ts";

const timepicker = [
  {
    ticker: "D",
    max: 80,
    value: 0,
  },
  {
    ticker: "H",
    max: 23,
    value: 0,
  },
  {
    ticker: "M",
    max: 59,
    value: 0,
  },
  {
    ticker: "S",
    max: 59,
    value: 0,
  },
];

export const CountdownSmall = ({ size }: { size?: "sm" | "lg" | "xl" }) => {
  const finishTime = new Date("09/30/2024 23:59:59");
  const { setFinished } = useCountdownStore();
  const TimerCompletion = () => (
    <span className="text-white">Presale countdown has ended</span>
  );

  // Renderer callback with condition
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
      const sz = size ?? "sm";

      // Render a countdown
      const d = days;
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;

      timepicker[0].value = d;
      timepicker[1].value = +h;
      timepicker[2].value = +m;
      timepicker[3].value = +s;

      return (
        <div className="relative flex flex-col text-[#ff3aba] gap-2 w-max">
          <span
            className={cn(
              "absolute text-center text-sm -top-6 left-1/2 -translate-x-1/2 w-full",
              sz != "sm" ? "hidden" : "",
            )}
          >
            Presale countdown timer
          </span>

          <div
            className={cn(
              "inline-flex gap-2 h-10",
              sz == "lg" ? "h-16" : sz == "xl" ? "h-20" : "",
            )}
          >
            {timepicker.map((time, index: number) => (
              <div
                key={index}
                className={cn(
                  "size-10",
                  sz == "lg" ? "size-16" : sz == "xl" ? "size-20" : "",
                )}
              >
                <CircularProgressbarWithChildren
                  value={time.value}
                  maxValue={time.max}
                  minValue={0}
                  styles={buildStyles({
                    pathColor: `#ff00a4`,
                    textColor: `#ff00a4`,
                  })}
                >
                  <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                    <span
                      className={cn(
                        "text-[14px] leading-0 h-fit",
                        sz == "lg"
                          ? "text-lg font-bold mb-1"
                          : sz == "xl"
                            ? "text-xl font-bold mb-2"
                            : "",
                      )}
                    >
                      {time.value}
                    </span>
                    <span
                      className={cn(
                        "absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2",
                        sz == "lg"
                          ? "text-base font-semibold top-5"
                          : sz == "xl"
                            ? "text-lg font-semibold top-5"
                            : "",
                      )}
                    >
                      {time.ticker}
                    </span>
                  </div>
                </CircularProgressbarWithChildren>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <Countdown
      date={finishTime}
      intervalDelay={0}
      precision={3}
      renderer={renderer}
      onComplete={() => setFinished(true)}
    />
  );
};

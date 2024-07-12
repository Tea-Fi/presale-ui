import { buildStyles, CircularProgressbarWithChildren } from "react-circular-progressbar";
import Countdown from 'react-countdown';
import { useCountdownStore } from "../hooks";

export const CountdownSmall = () => {
    const finishTime = new Date('09/30/2024 23:59:59');
    const { setFinished } = useCountdownStore();
    const TimerCompletion = () => <span className="text-white">Presale countdown has ended</span>;

    // Renderer callback with condition
    const renderer = ({ days, hours, minutes, seconds, completed}:{ days: number, hours: number, minutes: number, seconds: number, completed: boolean }) => {
      if (completed) {
        return <TimerCompletion />;
      } else {
        // Render a countdown
        const d = days;
        const h = hours < 10 ? `0${hours}`: hours;
        const m = minutes < 10 ? `0${minutes}`: minutes;
        const s = seconds < 10 ? `0${seconds}`: seconds;
        return (
            <div className="relative flex flex-col text-[#ff3aba] gap-2 w-max">
              <span className="absolute text-center text-sm -top-6 left-1/2 -translate-x-1/2 w-full">Presale countdown timer</span>
            
              <div className="inline-flex h-10 gap-2">
                <div className="size-10">
                  <CircularProgressbarWithChildren
                    value={d}
                    maxValue={50}
                    minValue={0}
                    styles={buildStyles({
                        pathColor: `#ff00a4`,
                        textColor: `#ff00a4`,
                    })}
                  >
                    <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                      <span className="text-[14px] leading-0 h-fit">{d}</span>
                      <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">D</span>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className="size-10">
                  <CircularProgressbarWithChildren
                      value={+h}
                      maxValue={23}
                      minValue={0}
                      styles={buildStyles({
                          pathColor: `#ff00a4`,
                          textColor: `#ff00a4`,
                      })}
                  >
                    <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                      <span className="text-[14px] leading-0 h-fit">{h}</span>
                      <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">H</span>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className="size-10">
                <CircularProgressbarWithChildren
                      value={+m}
                      maxValue={59}
                      minValue={0}
                      styles={buildStyles({
                          pathColor: `#ff00a4`,
                          textColor: `#ff00a4`,
                      })}
                  >
                    <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                      <span className="text-[14px] leading-0 h-fit">{m}</span>
                      <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">M</span>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
                <div className="size-10">
                  <CircularProgressbarWithChildren
                      value={+s}
                      maxValue={59}
                      minValue={0}
                      styles={buildStyles({
                          pathColor: `#ff00a4`,
                          textColor: `#ff00a4`,
                      })}
                  >
                    <div className="relative flex flex-col gap-0 text-[#ff00a4] text-center mb-2">
                      <span className="text-[14px] leading-0 h-fit">{s}</span>
                      <span className="absolute text-[10px] top-[15px] left-1/2 -translate-x-1/2">S</span>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
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
            onComplete={() => 
            setFinished(true)
            }
        />
    );
};

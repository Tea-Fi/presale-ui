import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { SlCard } from '@shoelace-style/shoelace/dist/react';
import { useEventContext } from '../context/event.context';
import { getPresaleRoundInfo } from '../utils/presale';
import { getTimeDiffrenece } from '../utils/calculation';
interface ICountdown {
  isActive: boolean | null;
  roundInfo: {
    currentRound: number;
    roundEnd: number;
  };
  setIsActive: Dispatch<SetStateAction<boolean | null>>;
}
export const Countdown = ({ isActive, roundInfo, setIsActive }: ICountdown) => {
  const [secondsToEnd, setSecondsToEnd] = useState<number | null>(null);
  const [countdownName, setCountdownName] = useState<string | null>(null);
  const { showModal, setEventInfo } = useEventContext();

  // useEffect(() => {
  //   let interval: NodeJS.Timer;
  //   let outinterval: NodeJS.Timer;

  //   const getTokenCountdown = async () => {
  //     const currentDate = new Date();
  //     const endDate = new Date(roundInfo.roundEnd * 1000);
  //     const secondsLeft = endDate.valueOf() - currentDate.valueOf();
  //     if (secondsLeft > 0) {
  //       interval = setInterval(() => {
  //         setSecondsToEnd((prev) => {
  //           if (prev === 1) {
  //             setIsActive(() => false);
  //             clearInterval(interval);
  //           }
  //           return prev ? prev - 1 : 0;
  //         });
  //       }, 1000);
  //     } else {
  //       const nextRound = await getPresaleRoundInfo(roundInfo.currentRound + 1);
  //       setEventInfo({
  //         title: `Presale Round ${roundInfo.currentRound} Round is Over!`,
  //         subTitle:
  //           nextRound.startTime > 0
  //             ? `Next round will start in ${getTimeDiffrenece(nextRound.startTime * 1000)}!`
  //             : 'Follow us on our social medias to get latest news.',
  //       });
  //       showModal();
  //     }
  //     setSecondsToEnd(Math.floor(secondsLeft / 1000));
  //     setIsActive(secondsLeft > 0);
  //     setCountdownName(`PRESALE ROUND ${roundInfo.currentRound}`);
  //   };
  //   if (roundInfo) {
  //     getTokenCountdown();
  //   }

  //   outinterval = setInterval(() => {
  //     clearInterval(interval);
  //     getTokenCountdown();
  //   }, 60000);

  //   return () => {
  //     interval && clearInterval(interval);
  //     outinterval && clearInterval(outinterval);
  //   };
  // }, [roundInfo]);

  const timeLeft = useMemo(
    () => ({
      days: isActive && secondsToEnd ? Math.floor(secondsToEnd / 86400) : 0,
      hours: isActive && secondsToEnd ? Math.floor((secondsToEnd % 86400) / 3600) : 0,
      minutes: isActive && secondsToEnd ? Math.floor((secondsToEnd % 3600) / 60) : 0,
      seconds: isActive && secondsToEnd ? secondsToEnd % 60 : 0,
    }),
    [isActive, secondsToEnd]
  );

  return (
    <SlCard data-hidden={secondsToEnd === null} className={`countdown ${isActive === false ? 'done' : ''}`}>
      <div className="countdown__inner">
        <div className="countdown__title">
          <h2>
            <span>{countdownName}</span>
          </h2>
          <span>end{isActive ? `s In:` : 'ed!'}</span>
        </div>
        <div className="countdown__timer">
          <span className="countdown__timer__value">{timeLeft.days}</span>
          <span className="countdown__timer__label">Days</span>
        </div>
        <div className="countdown__timer">
          <span className="countdown__timer__value">{timeLeft.hours}</span>
          <span className="countdown__timer__label">Hours</span>
        </div>
        <div className="countdown__timer">
          <span className="countdown__timer__value">{timeLeft.minutes}</span>
          <span className="countdown__timer__label">Minutes</span>
        </div>
        <div className="countdown__timer">
          <span className="countdown__timer__value">{timeLeft.seconds}</span>
          <span className="countdown__timer__label">Seconds</span>
        </div>
      </div>
    </SlCard>
  );
};

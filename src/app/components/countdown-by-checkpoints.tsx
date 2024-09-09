import Countdown from "react-countdown";
import { useEffect, useState } from "react";
import { ROUND_CLAIM_DURATION, ROUND_DURATION } from "../utils/constants";
import { useClaimActivePeriod } from "../hooks/useClaimActivePeriod";
import { useChainId } from "wagmi";
import { useClaimCheck } from "../hooks/useClaimCheck";
import { ClaimPeriodParsed } from "../utils/claim";

type TCheckpoint = {
  startClaimingRoundAt: number;
  finishClaimingRoundAt: number;
  startWaitingRoundAt: number;
  finishWaitingRountAt: number;
};

export const CountdownByCheckpoint = ({
  className,
  onChange,
  onFinish,
  claimPeriod,
}: {
  className?: string;
  claimPeriod: ClaimPeriodParsed;
  onChange?: (claimAvailable: boolean) => void;
  onFinish?: () => void;
}) => {
  const chainId = useChainId();
  const { canClaim } = useClaimCheck();

  const startDateNormal = claimPeriod.start.getTime();
  const finishDateNormal = claimPeriod.end.getTime();

  const { data: activePeriod, isLoading } = useClaimActivePeriod(chainId);

  const waitingClaimDurationNormal = ROUND_DURATION ?? 40_000;
  const pickClaimDurationNormal = ROUND_CLAIM_DURATION ?? 20_000;

  const [checkpoints, setCheckpoints] = useState<TCheckpoint[] | undefined>(
    undefined,
  );
  const [finishDateReal, setFinishDateReal] = useState(finishDateNormal);
  const [claimRoundStart, setClaimRoundStart] = useState<number>(0);
  const [claimRoundFinish, setClaimRoundFinish] = useState<number>(0);
  const [waitingRoundFinish, setWaitingRoundFinish] = useState<number>(0);
  const [isRoundComplete, setRoundComplete] = useState<boolean>(false);

  const [isInClaimRound, setInClaimRound] = useState<boolean>(false);
  const [isInWaitingRound, setInWaitingRound] = useState<boolean>(false);

  const createCheckpointsForWaitTime = (
    timeStart: number,
    timeEnd: number,
    roundDuration: number,
    cooldownDuration: number,
  ): any[] => {
    const checkpoints: TCheckpoint[] = [];

    for (
      let i = timeStart;
      i < timeEnd;
      i += roundDuration + cooldownDuration
    ) {
      const finishClimingRound = i + cooldownDuration;

      checkpoints.push({
        startClaimingRoundAt: i,
        finishClaimingRoundAt: finishClimingRound,
        startWaitingRoundAt: finishClimingRound,
        finishWaitingRountAt: finishClimingRound + roundDuration,
      });
    }

    return checkpoints;
  };

  const getCheckpointByTimestamp = (
    timestamp: number,
    finishDate: number,
    checkpoints: TCheckpoint[],
  ): TCheckpoint => {
    if (timestamp >= finishDate) {
      return checkpoints[checkpoints.length - 1];
    }

    for (let i = 0; i < checkpoints.length; i++) {
      const cp = checkpoints[i];

      if (timestamp < cp.startClaimingRoundAt) {
        return cp;
      }

      if (
        (timestamp >= cp.startClaimingRoundAt &&
          timestamp < cp.finishClaimingRoundAt) ||
        (timestamp >= cp.startWaitingRoundAt &&
          timestamp < cp.finishWaitingRountAt)
      ) {
        return cp;
      }
    }

    return {
      startClaimingRoundAt: 0,
      finishClaimingRoundAt: 0,
      startWaitingRoundAt: 0,
      finishWaitingRountAt: 0,
    };
  };

  const isInClaim = (): boolean => {
    const now = Date.now();
    let cpList = checkpoints;

    if (!cpList) {
      cpList = createCheckpointsForWaitTime(
        startDateNormal,
        finishDateNormal,
        waitingClaimDurationNormal,
        pickClaimDurationNormal,
      );
    }

    const cp = getCheckpointByTimestamp(now, finishDateNormal, cpList);

    return now >= cp.startClaimingRoundAt && now < cp.finishClaimingRoundAt;
  };

  const getElapsedDateByTimestamp = (
    timestamp: number,
    timeFinish: number,
  ): number => {
    if (timestamp >= timeFinish) {
      return 0;
    }

    return timeFinish - timestamp;
  };

  useEffect(() => {
    if (onChange) {
      onChange(isInClaim());
    }
  }, []);

  useEffect(() => {
    const now = Date.now();

    let cp = checkpoints;

    if (!cp) {
      cp = createCheckpointsForWaitTime(
        startDateNormal,
        finishDateNormal,
        waitingClaimDurationNormal,
        pickClaimDurationNormal,
      );

      setCheckpoints(cp);
      setFinishDateReal(cp[cp.length - 1].finishClaimingRoundAt);
    }

    // console.log("Real finish", new Date(finishDateReal).toDateString())
    // for(let i =0;i<cp.length;i++){
    //   console.log("round", i)
    //   console.log(new Date(cp[i].startClaimingRoundAt).toDateString())
    //   console.log(new Date(cp[i].finishClaimingRoundAt).toDateString())
    //   console.log(new Date(cp[i].startWaitingRoundAt).toDateString())
    //   console.log(new Date(cp[i].finishWaitingRountAt).toDateString())
    //   console.log("-------------------------------------")
    // }

    const currentCheckpoint = getCheckpointByTimestamp(
      now,
      finishDateNormal,
      cp,
    );

    if (now < finishDateReal) {
      setClaimRoundStart(currentCheckpoint.startClaimingRoundAt);
      setClaimRoundFinish(currentCheckpoint.finishClaimingRoundAt);
      setWaitingRoundFinish(currentCheckpoint.finishWaitingRountAt);

      setRoundComplete(false);

      if (onChange) {
        onChange(isInClaim());
      }
    }
  }, [isRoundComplete]);

  // Renderer callback with condition
  const renderer = ({ completed }: { completed: boolean }) => {
    if (completed) {
      setInClaimRound(false);
      setInWaitingRound(true);
      setRoundComplete(true);

      if (onFinish) {
        onFinish();
      }
      return <></>;
    } else {
      const now = Date.now();

      const inClaim = isInClaim();
      const isRoundStarted = now >= startDateNormal;

      let elapsed = !isRoundStarted
        ? getElapsedDateByTimestamp(now, claimRoundStart)
        : inClaim
          ? getElapsedDateByTimestamp(now, claimRoundFinish)
          : getElapsedDateByTimestamp(now, waitingRoundFinish);

      const claimIsActive =
        !isLoading &&
        activePeriod &&
        new Date(activePeriod.endDate).getTime() >= now &&
        canClaim;

      if (claimIsActive) {
        elapsed = getElapsedDateByTimestamp(
          now,
          new Date(activePeriod!.endDate).getTime(),
        );
      }

      if (inClaim && !isInClaimRound) {
        setInWaitingRound(false);
        setInClaimRound(true);
        setRoundComplete(true);
      } else if (!inClaim && !isInWaitingRound) {
        setInClaimRound(false);
        setInWaitingRound(true);
        setRoundComplete(true);
      }

      let seconds = Math.floor(elapsed / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      hours = hours - days * 24;
      minutes = minutes - days * 24 * 60 - hours * 60;
      seconds = seconds - days * 24 * 60 * 60 - hours * 60 * 60 - minutes * 60;

      const d = days ?? 0;
      const h = hours < 10 ? `0${hours}` : hours;
      const m = minutes < 10 ? `0${minutes}` : minutes;
      const s = seconds < 10 ? `0${seconds}` : seconds;

      if (claimIsActive) {
        return (
          <div className="flex flex-col gap-1 w-full text-end mb-4">
            <span className="text-xl">Claim your tokens</span>
            <span className={className}>
              {d > 1 ? `${d} Days` : d == 1 ? `${d} Day` : ""} {h}:{m}:{s}
            </span>
          </div>
        );
      }

      if (inClaim) {
        return;
      }

      return (
        <div className="flex flex-col gap-1 w-full text-end mb-4">
          <span className="text-xl">
            {inClaim ? "Claim your tokens" : "Next withdrawal window opens in"}
          </span>
          <span className={className}>
            {d > 1 ? `${d} Days` : d == 1 ? `${d} Day` : ""} {h}:{m}:{s}
          </span>
        </div>
      );
    }
  };

  if (!claimPeriod) return <></>;

  return (
    <Countdown
      autoStart
      date={finishDateReal}
      intervalDelay={1000}
      precision={3}
      renderer={renderer}
    />
  );
};

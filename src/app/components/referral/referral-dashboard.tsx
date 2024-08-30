import React from "react";
import {
  ShoppingCart,
  ShoppingBag,
  PersonStanding,
  Download,
  BarChart2,
} from "lucide-react";

import {
  calculateCommission,
  calculateStats,
  EventLogWithTimestamp,
  usdFormatter,
} from "./common";
import { DashboardPeriodSelector, PeriodFilter } from "./period-selector";
import { DashboardBlock } from "./dashboard-card";

import { Referral } from "../../utils/constants";
import { ClaimAmount } from "../../utils/claim";
import { parseHumanReadable } from "../../utils";
import { useAccount, useChainId } from "wagmi";
import { useLastClaims } from "../../hooks/useLastClaims";
import { useGetReferralTree } from "../../hooks/useGetReferralTree";
import { isEmpty } from "lodash-es";

interface Props {
  tree: Referral;
  logs: EventLogWithTimestamp[];
  address: string;
  claimed: ClaimAmount[];
}

export const ReferralDashboard: React.FC<Props> = (props) => {
  const account = useAccount();

  const chainId = useChainId();
  const { data: lastClaim } = useLastClaims(chainId, account.address);
  const { data: referralTree } = useGetReferralTree({
    address: account.address,
    chainId,
  });

  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState<EventLogWithTimestamp[]>([]);
  const [unclaimedLogs, setUnclaimedLogs] = React.useState<
    EventLogWithTimestamp[]
  >([]);

  const [dateBoundary, setDateBoundary] = React.useState<Date>();
  const [period, setPeriod] = React.useState<PeriodFilter>(
    PeriodFilter.threeMonths,
  );

  const periodSelectorOnChange = React.useCallback(
    (period: PeriodFilter, date: Date) => {
      setDateBoundary(date);
      setPeriod(period);
    },
    [],
  );

  const team = React.useMemo(() => {
    if (!props.tree) {
      return;
    }

    const list = [];
    const queue = [props.tree];

    while (queue.length > 0) {
      const current = queue.pop()!;

      list.push(current);

      queue.push(
        ...Object.keys(current.subleads ?? {}).map(
          (x) => current.subleads?.[x]!,
        ),
      );
    }

    return list;
  }, [props.tree]);

  const info = React.useMemo(() => {
    if (
      !logs ||
      !props.tree ||
      !team ||
      !props.address ||
      !props.claimed ||
      !referralTree
    )
      return;

    const stats = calculateStats(logs);
    const myRefCodeStats = stats[referralTree?.id];

    const myTeamStats = team.map((x) => stats[x.id]);
    const purchases = myTeamStats.reduce(
      (acc, e) => acc + (e?.purchases || 0),
      0,
    );

    const totalPurchasesUsd = myTeamStats.reduce(
      (acc, e) => acc + e.soldInUsd,
      0n,
    );
    const averageTeamEarnings =
      purchases > 0 ? totalPurchasesUsd / BigInt(purchases) : 0n;

    const directPurchases = BigInt(myRefCodeStats?.soldInUsd || 0);

    const earnings = calculateCommission(props.tree, logs, {
      leavePrecision: true,
    });
    const unclaimedEarnings = calculateCommission(props.tree, unclaimedLogs, {
      leavePrecision: true,
    });

    return {
      purchases: totalPurchasesUsd,
      teamSize: myTeamStats.length - 1,

      earnings: earnings.soldInUsd,
      unclaimedEarnings: unclaimedEarnings.soldInUsd,

      directPurchases,
      teamEarnings: averageTeamEarnings,
      teamPurchases: Object.keys(stats)
        .filter((key) => team.some((x) => x.id === Number(key)))
        .reduce((acc, e) => acc + stats[e].purchases, 0),
    };
  }, [props.tree, props.address, props.claimed, logs, team, referralTree]);

  const getFilterLogs = React.useCallback(
    async (filters: { boundary?: Date; lastClaimDate?: string }) => {
      setLoading(true);

      const ids = new Set(team?.map((x) => x.id) ?? []);
      const relevantLogs = props.logs
        .filter((x) => ids.has((x.args as any)["referrerId"] as number))
        .reverse();

      const targetLogs = [] as EventLogWithTimestamp[];
      const unclaimedLogs = [] as EventLogWithTimestamp[];

      const claimDate =
        filters.lastClaimDate && new Date(filters.lastClaimDate);

      for (const log of relevantLogs) {
        if (filters.boundary && log.time < filters.boundary) {
          break;
        }

        if (!claimDate || log.time >= claimDate) {
          unclaimedLogs.push(log);
        }

        targetLogs.push(log);
      }

      setLogs(targetLogs.reverse());
      setUnclaimedLogs(unclaimedLogs.reverse());

      setLoading(false);
    },
    [team, props.logs],
  );

  React.useEffect(() => {
    if (!props.tree) {
      return;
    }

    if (period !== PeriodFilter.threeMonths && dateBoundary) {
      getFilterLogs({
        boundary: dateBoundary,
        lastClaimDate: lastClaim?.period?.startDate,
      });
    }

    if (period === PeriodFilter.threeMonths) {
      getFilterLogs({
        lastClaimDate: lastClaim?.period?.startDate,
      });
    }
  }, [props.tree, props.logs, dateBoundary, lastClaim]);

  return (
    <article className="dashboard-container">
      <header className="flex flex-row flex-wrap justify-between items-center w-full gap-8">
        <div>Dashboard</div>

        <DashboardPeriodSelector onChange={periodSelectorOnChange} />
      </header>

      {loading && <div>Loading</div>}

      {!loading && !isEmpty(info) && (
        <main>
          <DashboardBlock
            title="Total Purchases"
            value={`$${usdFormatter.format(parseHumanReadable(info.purchases, 6, 2))}`}
            icon={<ShoppingCart />}
          />

          <DashboardBlock
            title="NO. of Purchases"
            value={info.teamPurchases.toString()}
            icon={<ShoppingBag />}
          />

          <DashboardBlock
            title="My Team"
            value={info.teamSize.toString()}
            icon={<PersonStanding />}
          />

          <DashboardBlock
            title="My Earning"
            value={`$${usdFormatter.format(parseHumanReadable(info.earnings, 10, 2))}`}
            icon={<Download />}
          />

          <DashboardBlock
            title="Direct Purchases"
            value={`$${usdFormatter.format(parseHumanReadable(info.directPurchases, 6, 2))}`}
            icon={<BarChart2 />}
          />

          <DashboardBlock
            title="Withdrawable earnings"
            value={`$${usdFormatter.format(parseHumanReadable(info.unclaimedEarnings, 10, 2))}`}
            icon={<BarChart2 />}
          />
        </main>
      )}
    </article>
  );
};

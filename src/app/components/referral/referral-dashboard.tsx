import React from "react";
import { ShoppingCart, ShoppingBag, PersonStanding, Download, BarChart2 } from "lucide-react";

import { getBlock } from "viem/actions";
import { getClient } from "@wagmi/core";

import { calculateCommission, calculateStats, EventLog, usdFormatter } from "./common";
import { DashboardPeriodSelector, PeriodFilter } from "./period-selector";
import { DashboardBlock } from "./dashboard-card";

import { wagmiConfig } from "../../config";
import { Referral } from "../../utils/constants";
import { ClaimAmount } from "../../utils/claim";
import { parseHumanReadable } from "../../utils";


interface Props {
  tree: Referral;
  logs: EventLog[];

  address: string;

  claimed: ClaimAmount[];
}

export const ReferralDashboard: React.FC<Props> = (props) => {
  const [logs, setLogs] = React.useState<EventLog[]>(props.logs);
  const [dateBoundary, setDateBoundary] = React.useState<Date>();
  const [period, setPeriod] = React.useState<PeriodFilter>(PeriodFilter.threeMonths);
  
  const periodSelectorOnChange = React.useCallback((period: PeriodFilter, date: Date) => {
    setDateBoundary(date);
    setPeriod(period);
  }, [])
 
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
        ...Object
          .keys(current.subleads ?? {})
          .map(x => current.subleads?.[x]!)
      );
    }

    return list;
  }, [props.tree])
  
  const info = React.useMemo(() => {
    if (!props.tree || !team || !props.address || !props.claimed) return;

    const stats = calculateStats(logs);

    const memo = {}
    const subs = team
      .filter(x => x.wallet !== props.address)
      .map(x => stats[x.id])

    const subStats = subs.filter(x => !!x);
      
    const purchases = subStats
      .reduce((acc, e) => acc + e.purchases, 0);
     
    const totalPurchasesUsd = subStats
      .reduce((acc, e) => acc + e.soldInUsd, 0n);

    const averageTeamEarnings = purchases > 0
      ? totalPurchasesUsd / BigInt(purchases)
      : 0n;

    const earnings = calculateCommission(props.tree, stats, memo, { leavePrecision: true })
    const claimed = props.claimed
      .reduce((acc, e) => acc + BigInt(e.amountUsd), 0n);

    return {
      purchases: totalPurchasesUsd,
      teamSize: subs.length,

      earnings: earnings.soldInUsd,
      unclaimedEarnings: earnings.soldInUsd > claimed
        ? earnings.soldInUsd - claimed
        : 0n,

      teamEarnings: averageTeamEarnings,
      teamPurchases: Object.keys(stats)
        .filter(key => team.some(x => x.id === Number(key)))
        .filter(key  => Number(key) !== props.tree.id)
        .reduce((acc, e) => acc + stats[e].purchases, 0),
    };
  }, [props.tree, props.address, props.claimed, logs, team ])

  const getFilterLogs = React.useCallback(async (boundary: Date) => {
    const client = getClient(wagmiConfig);

    const ids = new Set(team?.map(x => x.id) ?? []);
    const relevantLogs = await Promise.all(
      props.logs
        .filter(x => ids.has((x.args as any)['referrerId'] as number))
        .map(async x => ({ 
          ...x,
          timestamp: await getBlock(client!, { blockNumber: x.blockNumber })
            .then(x => x?.timestamp) 
          }))
    );
   
    const targetLogs = relevantLogs
      .filter(x => x.timestamp && new Date(Number(x.timestamp) *1e3) >= boundary);
      
    setLogs(targetLogs);
  }, [team, props.logs]);

  React.useEffect(() => {
    if (!props.tree) {
      return;
    }

    if (period !== PeriodFilter.threeMonths && dateBoundary) {
      getFilterLogs(dateBoundary);
    }
    
    if (period === PeriodFilter.threeMonths) {
      setLogs(props.logs)
    }
  }, [props.tree, props.logs, dateBoundary])
  
  return (
    <article className="dashboard-container">
      <header className='flex flex-row flex-wrap justify-between items-center w-full gap-8'>
        <div>Dashboard</div>

        <DashboardPeriodSelector onChange={periodSelectorOnChange} />
      </header>

      {!info && (<div>Loading</div>)}

      {info && (
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
            title="Average Team Earning"
            value={`$${usdFormatter.format(parseHumanReadable(info.teamEarnings, 6, 2))}`}
            icon={<BarChart2 />}
          />
          
          <DashboardBlock
            title="Unclaimed Earning"
            value={`$${usdFormatter.format(parseHumanReadable(info.unclaimedEarnings, 10, 2))}`}
            icon={<BarChart2 />}
          />
        </main>
      )}

    </article>
  )
};

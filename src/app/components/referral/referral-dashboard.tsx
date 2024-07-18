import React from "react";
import { getChainId, getClient } from "@wagmi/core";

import { AbiEvent, getAbiItem } from "viem";
import { getBlock, getLogs } from "viem/actions";

import { calculateCommission, emptyStat, StatsMap, usdFormatter } from "./common";

import { wagmiConfig } from "../../config";
import { PRESALE_ABI } from "../../utils/presale_abi";
import { PRESALE_CONTRACT_ADDRESS, Referral } from "../../utils/constants";
import { DashboardPeriodSelector } from "./period-selector";
import { ShoppingCart, ShoppingBag, PersonStanding, Download, BarChart2 } from "lucide-react";
import { DashboardBlock } from "./dashboard-card";

interface Props {
  tree: Referral;
  address: string;
}

export const ReferralDashboard: React.FC<Props> = (props) => {
  const chainId = getChainId(wagmiConfig);

  const [dateBoundary, setDateBoundary] = React.useState<Date>();
  const [referralStats, setReferralStats] = React.useState<StatsMap>();
  
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
    if (!props.tree || !referralStats || !team || !props.address) return;

    const memo = {}
    const stat = referralStats[props.tree.id] ?? emptyStat();
   
    const subs = team
      .filter(x => x.wallet !== props.address)
      .map(x => referralStats[x.id])

    const subStats = subs.filter(x => !!x);
      
    const purchases = subStats
      .reduce((acc, e) => acc + e.purchases, 0);
     
    const totalPurchasesUsd = subStats
      .reduce((acc, e) => acc + e.soldInUsd, 0n) / BigInt(1e4);

    const averageTeamEarnings = purchases > 0
      ? totalPurchasesUsd / BigInt(purchases)
      : 0;

    return {
      purchases: totalPurchasesUsd,
      teamSize: subs.length,

      earnings: calculateCommission(props.tree, referralStats, memo).soldInUsd
        - (stat.soldInUsd * BigInt(props.tree.fee!) / BigInt(1e4)),

      teamEarnings: averageTeamEarnings,
      teamPurchases: Object.keys(referralStats)
        .filter(key  => Number(key) !== props.tree.id)
        .reduce((acc, e) => acc + referralStats[e].purchases, 0),
    };
  }, [props.tree, props.address, referralStats, team ])

  const getFilterLogs = React.useCallback(async (boundary: Date) => {
    const client = getClient(wagmiConfig);

    const abi = getAbiItem({ abi: PRESALE_ABI, name: 'BuyTokens' }) as AbiEvent;
    const logs = await getLogs(client!, {
      address: PRESALE_CONTRACT_ADDRESS[chainId] as `0x${string}`,
      fromBlock: 0n,
      event: abi
    });

    const ids = new Set(team?.map(x => x.id) ?? []);
    const relevantLogs = await Promise.all(
      logs
        .filter(x => ids.has((x.args as any)['referrerId'] as number))
        .map(async x => ({ 
          ...x,
          timestamp: await getBlock(client!, { blockNumber: x.blockNumber })
            .then(x => x?.timestamp) 
          }))
    );
   
    const targetLogs = relevantLogs
      .filter(x => x.timestamp && new Date(Number(x.timestamp) *1e3) >= boundary);

    console.log(targetLogs);

    const stats = {} as StatsMap;

    for (const entry of targetLogs) {
      const args = (entry.args as any)
      const stat = stats[Number(args['referrerId'] as number)] ?? {
        purchases: 0,
        soldInUsd: 0n,
        tokensSold: 0n
      };

      stat.purchases += 1;
      stat.soldInUsd += BigInt(args['tokensSoldAmountInUsd']);
      stat.tokensSold += BigInt(args['tokenSoldAmount']);

      stats[Number(args['referrerId'] as number)] = stat;
    }

    console.log(stats);

    setReferralStats(stats);
  }, [team]);

  React.useEffect(() => {
    if (props.tree && dateBoundary) {
      getFilterLogs(dateBoundary);
    }
  }, [props.tree, dateBoundary])
  
  return (
    <article className="dashboard-container">
      <header className='flex flex-row flex-wrap justify-between items-center w-full gap-8'>
        <div>Dashboard</div>

        <DashboardPeriodSelector onChange={setDateBoundary} />
      </header>

      {!info && (<div>Loading</div>)}

      {info && (
        <main>
          <DashboardBlock
            title="Total Purchases"
            value={`$${usdFormatter.format(Number(info.purchases) / 100)}`}
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
            value={`$${usdFormatter.format(Number(info.earnings / BigInt(1e4)) / 100)}`}
            icon={<Download />}
          />
          
          <DashboardBlock
            title="Average Team Earning"
            value={`$${usdFormatter.format(Number(info.teamEarnings) / 100)}`}
            icon={<BarChart2 />}
          />
        </main>
      )}

    </article>
  )
};
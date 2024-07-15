import React, { useEffect } from 'react';

import { useAccount, useAccountEffect } from "wagmi";
import { getChainId, getClient } from "@wagmi/core";

import { AbiEvent, getAbiItem } from 'viem';
import { getLogs, getBlock } from 'viem/actions';

import { PRESALE_CONTRACT_ADDRESS, Referral } from "../utils/constants";
import { PRESALE_ABI } from "../utils/presale_abi";

import { wagmiConfig } from "../config";
import { getReferralTreeByWallet } from '../utils/referrals';

import { ShoppingCart, BarChart2, ShoppingBag, Download, PersonStanding } from 'lucide-react';

interface ReferralStats {
  purchases: number;
  tokensSold: bigint;
  soldInUsd: bigint;
}

type StatsMap = Record<string, ReferralStats>;

const emptyStat =  { purchases: 0, soldInUsd: 0n, tokensSold: 0n } as ReferralStats;

function getFeeFactor(node?: Referral) {
  return BigInt((node?.fee ?? 0));
}

function addStats(a: ReferralStats, b: ReferralStats): ReferralStats {
  if (!b) return a; 
  if (!a) return b; 

  return {
    purchases: a.purchases + b.purchases,
    soldInUsd: a.soldInUsd + b.soldInUsd,
    tokensSold: a.tokensSold + b.tokensSold,
  };
}

function factorStats(a: ReferralStats, factor: bigint): ReferralStats {
  return {
    purchases: a.purchases,
    soldInUsd: a.soldInUsd * factor,
    tokensSold: a.tokensSold,
  }
}

function calculateCommission(node: Referral, stats: StatsMap, memo?: Record<number, ReferralStats>): ReferralStats {
  const fee = getFeeFactor(node);
  const stat = stats[node.id]?? {
    purchases: 0,
    soldInUsd: 0n,
    tokensSold: 0n
  };

  const current = factorStats(stat, fee);

  const subtreeList = Object.keys(node.subleads ?? {})
    .map(key => node.subleads?.[key])
    .map(x => factorStats(subtreeSum(stats, x, memo), (fee - getFeeFactor(x))))
     
  const subtree = subtreeList
    .reduce((acc, e) => addStats(acc, e), emptyStat)

  const result = addStats(current, subtree);

  result.soldInUsd /= BigInt(1e6 * 1e2);
  result.tokensSold /= BigInt(1e18);

  return result; 
}

function subtreeSum(stats: StatsMap, node?: Referral, memo?: Record<number, ReferralStats>): ReferralStats {
  if (!node) {
    return emptyStat;
  }
 
  if (memo?.[node.id]) return memo[node.id];
 
  const stat = stats[node.id] ?? {
    purchases: 0,
    soldInUsd: 0n,
    tokensSold: 0n
  };

  if (!node.subleads || Object.keys(node.subleads ?? {}).length === 0) {
    return stat;
  }

  const subleadSum = Object.keys(node.subleads ?? {})
    .map(key => subtreeSum(stats, node.subleads?.[key]))
    .filter(x => !!x)
    .reduce((acc, e) => addStats(acc, e), emptyStat);
   
  const sum = addStats(subleadSum, stat)
   
  if (memo) {
    memo[node.id] = sum;
  }
 
  if (!sum) {
    return emptyStat;
  }

  return sum;
}

const usdFormatter = Intl.NumberFormat('en-US', { currency: 'usd', maximumFractionDigits: 2 })

enum PeriodFilter {
  day = '1D',
  week = '1W',
  month = '1M',
  threeMonths = '3M'
}

interface PeriodSelectorProps {
  onChange: (date: Date) => void;
}

const DashboardPeriodSelector = (props: PeriodSelectorProps) => {
  const [periodFilter, setPeriodFilter] = React.useState<PeriodFilter>(PeriodFilter.threeMonths);
 
  useEffect(() => {
    const now = new Date(); 
    switch (periodFilter) {
      case PeriodFilter.day:
        now.setDate(now.getDate() -1);
        break; 
        
      case PeriodFilter.week:
        now.setDate(now.getDate() -7);
        break; 

      case PeriodFilter.month:
        now.setMonth(now.getMonth() -1);
        break; 

      case PeriodFilter.threeMonths:
        now.setMonth(now.getMonth() -3);
        break; 
    }

    props.onChange(now);
  }, [periodFilter])

  return (
    <div className="dashboard-filters flex flex-row gap-2">
      {Object.values(PeriodFilter).map(option => (
        <div
          key={option} 
          data-selected={periodFilter === option}
          onClick={() => setPeriodFilter(option)}
        >
          {option}
        </div>
      ))}
    </div>
  )
}

export const DashboardPage = () => {
  const chainId = getChainId(wagmiConfig);

  const { address, isConnected } = useAccount();

  const [dateBoundary, setDateBoundary] = React.useState<Date>();

  const [referralTree, setReferralTree] = React.useState<Referral>();
  const [referralStats, setReferralStats] = React.useState<StatsMap>();
  
  const team = React.useMemo(() => {
    if (!referralTree) {
      return;
    }

    const list = [];
    const queue = [referralTree];

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
  }, [referralTree])
  
  const info = React.useMemo(() => {
    if (!referralTree || !referralStats || !team || !address) return;

    const memo = {}
    const stat = referralStats[referralTree.id] ?? emptyStat;

    const subs = team
      .filter(x => x.wallet !== address);

    const averageTeamEarnings = subs 
      .map(x => calculateCommission(x, referralStats, memo))
      .reduce((acc, e) => acc + e.soldInUsd, 0n)
        / BigInt(subs.length);

    return {
      purchases: stat.purchases,
      teamSize: subs.length,

      earnings: calculateCommission(referralTree, referralStats, memo),

      teamEarnings: averageTeamEarnings,
      teamPurchases: Object.keys(referralStats)
        .reduce((acc, e) => acc + referralStats[e].purchases, 0),

      
    };
  }, [referralTree, referralStats, team, address])

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

  const getReferralTree = React.useCallback(() => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const refAddress = urlParams.get("address") || address;

    if (refAddress) {
      getReferralTreeByWallet(refAddress, chainId).then(refTree => {
        if (refTree !== undefined) {
          setReferralTree(refTree);
        }
      });
    }
  }, [address, chainId])

  useEffect(() => {
    if (isConnected) {
      getReferralTree();
    }
  }, [isConnected, getReferralTree])

  useEffect(() => {
    if (referralTree && dateBoundary) {
      getFilterLogs(dateBoundary);
    }
  }, [dateBoundary, referralTree])

  useAccountEffect({
    onConnect() {
      getReferralTree();
    },
    onDisconnect() {
      setReferralTree(undefined);
    },
  });



  return (
    <article className="dashboard-container">

      <header className='flex flex-row flex-wrap justify-between items-center w-full gap-8'>
        <div>Dashboard</div>

        <DashboardPeriodSelector onChange={setDateBoundary} />
      </header>

      {!info && (<div>Loading</div>)}
      {info && (
        <main>
          <div className='dashboard-card'>
            <div className='dashboard-card__icon'>
              <ShoppingCart />
            </div>

            <div className='dashboard-card__title'>
              Total Purchases
            </div>

            <div className='dashboard-card__value'>
              {info.purchases}
            </div>
          </div>

          <div className='dashboard-card'>
            <div className='dashboard-card__icon'>
              <PersonStanding />
            </div>
            <div className='dashboard-card__title'>
              My Team
            </div>
            <div className='dashboard-card__value'>
              {info.teamSize}
            </div>
          </div>

          <div className='dashboard-card'>
            <div className='dashboard-card__icon'>
              <ShoppingBag />
            </div>
            
            <div className='dashboard-card__title'>
              NO. of Purchases
            </div>

            <div className='dashboard-card__value'>
              {info.teamPurchases}
            </div>
          </div>
          <div className='dashboard-card'>
            <div className='dashboard-card__icon'>
              <Download />
            </div>
            <div className='dashboard-card__title'>
              My earnings
            </div>
            <div className='dashboard-card__value'>
              ${usdFormatter.format(Number(info.earnings.soldInUsd) / 100)}
            </div>
          </div>
          <div className='dashboard-card'>
            <div className='dashboard-card__icon'>
              <BarChart2 />
            </div>
            <div className='dashboard-card__title'>
              Average Team Earning
            </div>
            <div className='dashboard-card__value'>
              ${usdFormatter.format(Number(info.teamEarnings) / 100)}
            </div>
          </div>
        </main>
      )}

    </article>
  )
};

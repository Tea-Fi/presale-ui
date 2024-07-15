import React, { useEffect } from 'react';

import { useAccount, useAccountEffect } from "wagmi";
import { getChainId } from "@wagmi/core";

import { PRESALE_CONTRACT_ADDRESS, Referral } from "../utils/constants";
import { PRESALE_ABI } from "../utils/presale_abi";

import { wagmiConfig } from "../config";
import { getReferralTreeByWallet } from '../utils/referrals';

import { ShoppingCart, BarChart2, ShoppingBag, Download, PersonStanding } from 'lucide-react';
import { ethers, EventLog } from 'ethers';

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

  result.soldInUsd /= BigInt(1e6) * BigInt(1e4);
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

const usdFormatter = Intl.NumberFormat('en-US', { currency: 'usd' })

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
    if (!referralTree || !referralStats || !team) return;

    const memo = {}
    const stat = referralStats[referralTree.id] ?? emptyStat;


    const teamEarnings = team
      .map(x => calculateCommission(x, referralStats, memo))

    const averageTeamEarnings = teamEarnings.reduce((acc, e) => acc + e.soldInUsd, 0n)
      / BigInt(team.length);

    return {
      purchases: stat.purchases,
      teamSize: team.length,

      earing: calculateCommission(referralTree, referralStats, memo),

      teamEarnings: averageTeamEarnings,
      teamPurchases: Object.keys(referralStats)
        .reduce((acc, e) => acc + referralStats[e].purchases, 0),

      
    };
  }, [referralTree, referralStats, team])

  // const getReferralAmounts = React.useCallback(async (referralId: any): Promise<ReferralStats> => {
  //   /*
  //     struct Referral {
  //         /// @dev Number of purchases
  //         uint16 referrals;
  //         /// @dev The amount of tokens sold through referrals
  //         uint256 sold;
  //         /// @dev The total amount of USD equivalent of tokens sold through referrals
  //         uint256 soldInUsd;
  //     }
  //   */
  //   const result = await readContract(wagmiConfig, {
  //     abi: PRESALE_ABI,
  //     address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
  //     args: [referralId],
  //     functionName: "referrals",
  //   });

  //   const [purchases, tokensSold, soldInUsd]: any = result;

  //   return {
  //     purchases,
  //     soldInUsd: soldInUsd, // / BigInt(10**6),
  //     tokensSold: tokensSold, // / BigInt(10**18),
  //   };
  // }, [chainId]);

  const getFilterLogs = React.useCallback(async (boundary: Date) => {
    const provider = ethers.getDefaultProvider(
      import.meta.env.VITE_PUBLIC_INFURA_URL
    );

    const presaleContract = new ethers.Contract(
      PRESALE_CONTRACT_ADDRESS[chainId],
      PRESALE_ABI,
      provider
    );

    const to = await provider.getBlockNumber() 
    const step = 50000;
  
    let start = to - step; 
    let end = to; 

    const logs: EventLog[] = [];

    const filter = presaleContract.filters.BuyTokens();

    while (true) {
      const temp = await presaleContract.queryFilter(filter, start, end);
     
      if (temp.length === 0) {
        break;
      }

      logs.push(...temp as EventLog[]);
      
      start -= step; 
      end -= step; 
    } 

    const ids = new Set(team?.map(x => BigInt(x.id)) ?? []);
    const relevantLogs = await Promise.all(
      logs
        .filter(x => ids.has(x.args[4]))
        .map(async x => ({ ...x, timestamp: await provider.getBlock(x.blockNumber).then(x => x?.timestamp) }))
    );
   
    const targetLogs = relevantLogs
      .filter(x => x.timestamp && new Date(x.timestamp * 1e3) >= boundary);

    console.log(targetLogs);

    const stats = {} as StatsMap;

    for (const entry of targetLogs) {
      const stat = stats[Number(entry.args[4])] ?? {
        purchases: 0,
        soldInUsd: 0n,
        tokensSold: 0n
      };

      stat.purchases += 1;
      stat.soldInUsd += entry.args[5];
      stat.tokensSold += entry.args[6];

      stats[Number(entry.args[4])] = stat;
    }

    console.log(stats);

    setReferralStats(stats);
  }, [team]);

  // const getRefTreeStats = async (refTree?: Referral): Promise<Record<number, ReferralStats>> => {
  //   let stats = {} as Record<number, ReferralStats>;

  //   if (refTree != undefined) {
  //     stats[refTree.id] = await getReferralAmounts(refTree.id);

  //     for (const sublead of Object.values(refTree?.subleads || {})) {
  //       stats = { ...stats, ...(await getRefTreeStats(sublead)) };
  //     }
  //   }

  //   return stats;
  // };
  // const processReferralsTreeGains = async (refTree: Referral) => {
  //   const stats = await getRefTreeStats(refTree);
  //   setReferralStats(stats);
  // };

  const getReferralTree = React.useCallback(() => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const refAddress = urlParams.get("address") || address;

    if (refAddress) {
      getReferralTreeByWallet('0x8F70F2783Ba1164B82542f3060B2d32cefEc05E4', chainId).then(refTree => {
        if (refTree !== undefined) {
          setReferralTree(refTree);
          // processReferralsTreeGains(refTree);
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

      <header className='flex flex-row justify-between items-center w-full gap-8'>
        <div>Leaders Dashboard</div>

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
              ${usdFormatter.format(info.earing.soldInUsd)}
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
              ${usdFormatter.format(info.teamEarnings)}
            </div>
          </div>
        </main>
      )}

    </article>
  )
};

import { Referral } from "../../utils/referrals";

export interface ReferralStats {
  purchases: number;
  tokensSold: bigint;
  soldInUsd: bigint;
}


export type StatsMap = Record<string, ReferralStats>;

export const emptyStat = () =>   ({ purchases: 0, soldInUsd: 0n, tokensSold: 0n } as ReferralStats);
export const usdFormatter = Intl.NumberFormat('en-US', { currency: 'usd', maximumFractionDigits: 2 })


export function getFeeFactor(node?: Referral) {
  return BigInt((node?.fee ?? 0));
}

export function addStats(a: ReferralStats, b: ReferralStats): ReferralStats {
  if (!b) return a; 
  if (!a) return b; 

  return {
    purchases: a.purchases + b.purchases,
    soldInUsd: a.soldInUsd + b.soldInUsd,
    tokensSold: a.tokensSold + b.tokensSold,
  };
}

export function factorStats(a: ReferralStats, factor: bigint): ReferralStats {
  return {
    purchases: a.purchases,
    soldInUsd: a.soldInUsd * factor,
    tokensSold: a.tokensSold,
  }
}

// export function calculateCommission(node: Referral, stats: StatsMap, memo?: Record<number, ReferralStats>): ReferralStats {
//   const fee = getFeeFactor(node);
//   const stat = stats[node.id]!;

//   const current = factorStats(stat, fee);

//   const subtreeList = Object.keys(node.subleads ?? {})
//     .map(key => node.subleads?.[key])
//     .map(x => factorStats(subtreeSum(stats, x, memo), (fee - getFeeFactor(x))))
     
//   const subtree = subtreeList
//     .reduce((acc, e) => addStats(acc, e), emptyStat())

//   const result = addStats(current, subtree);

//   result.soldInUsd /= BigInt(1e6) * BigInt(1e4);
//   result.tokensSold /= BigInt(1e18);

//   return result; 
// }

export function subtreeSum(stats: StatsMap, node?: Referral, memo?: Record<number, ReferralStats>): ReferralStats {
  if (!node) {
    return emptyStat();
  }
 
  if (memo?.[node.id]) return memo[node.id];
 
  const stat = stats[node.id] ?? emptyStat();

  if (!node.subleads || Object.keys(node.subleads ?? {}).length === 0) {
    return stat;
  }

  const subleadSum = Object.keys(node.subleads ?? {})
    .map(key => subtreeSum(stats, node.subleads?.[key]))
    .filter(x => !!x)
    .reduce((acc, e) => addStats(acc, e), emptyStat());
   
  const sum = addStats(subleadSum, stat)
   
  if (memo) {
    memo[node.id] = sum;
  }
 
  if (!sum) {
    return emptyStat();
  }

  return sum;
}


export function calculateCommission(node: Referral, stats: StatsMap, memo?: Record<number, ReferralStats>): ReferralStats {
  const fee = getFeeFactor(node);
  const stat = stats[node.id] ?? emptyStat();

  const current = factorStats(stat, fee);

  const subtreeList = Object.keys(node.subleads ?? {})
    .map(key => node.subleads?.[key])
    .map(x => factorStats(subtreeSum(stats, x, memo), (fee - getFeeFactor(x))))
     
  const subtree = subtreeList
    .reduce((acc, e) => addStats(acc, e), emptyStat())

  const result = addStats(current, subtree);

  result.soldInUsd /= BigInt(1e4);
  result.tokensSold /= BigInt(1e18);

  return result; 
}

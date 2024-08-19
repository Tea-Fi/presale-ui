import { AbiEvent, Address, Log } from "viem";
import { readContract } from "@wagmi/core";

import { wagmiConfig } from "../../config";
import { Referral } from "../../utils/referrals";
import { PRESALE_ABI } from "../../utils/presale_abi";
import { PRESALE_CONTRACT_ADDRESS } from "../../utils/constants";

export type EventLog = Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>;
export type EventLogWithTimestamp = EventLog & { time: Date };

export interface ReferralStats {
  purchases: number;
  tokensSold: bigint;
  soldInUsd: bigint;
}


export type StatsMap = Record<string, ReferralStats>;

export const emptyStat = () => ({ purchases: 0, soldInUsd: 0n, tokensSold: 0n } as ReferralStats);
export const usdFormatter = Intl.NumberFormat('en-US', { currency: 'usd', maximumFractionDigits: 2 })

export const getArg = <T,>(log: EventLog, key: string) =>
  (log.args as Record<string, unknown>)[key] as T;

export const getStat = (log: EventLog): ReferralStats => ({
  purchases: 1,
  tokensSold: getArg(log, 'tokenSoldAmount'),
  soldInUsd: getArg(log, 'tokensSoldAmountInUsd'),
});


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

export function factorStats(a: ReferralStats, factor: bigint, factorTokens?: boolean): ReferralStats {
  return {
    purchases: a.purchases,
    soldInUsd: a.soldInUsd * factor,
    tokensSold: factorTokens
      ? a.tokensSold * factor
      : a.tokensSold,
  }
}

export function subtreeSum(logs: EventLogWithTimestamp[], node?: Referral, parent?: Referral, factorTokens?: boolean): ReferralStats {
  if (!node) {
    return emptyStat();
  }
  
  const nodeLogs = mapLogs(node, logs);
  const rootLogs = parent && mapLogs(parent, logs)

  const stat = nodeLogs
    .filter(x => getArg<number>(x, 'referrerId') === node.id)
    .reduce((acc, e) => {
      const rootLog = rootLogs
        ?.find(x => x.blockNumber === e.blockNumber);

      return addStats(
        acc,
        factorStats(
          getStat(e),
          BigInt(
            rootLog 
              ? rootLog.fee - e.fee
              : e.fee
          ),
          factorTokens
        )
      )
    }, emptyStat())

  if (!node.subleads || Object.keys(node.subleads ?? {}).length === 0) {
    return stat;
  }

  const subleadSum = Object.keys(node.subleads ?? {})
    .map(key => subtreeSum(logs, node.subleads?.[key], parent))
    .filter(x => !!x)
    .reduce((acc, e) => addStats(acc, e), emptyStat());

  const sum = addStats(subleadSum, stat)

  // if (memo) {
  //   memo[node.id] = sum;
  // }

  if (!sum) {
    return emptyStat();
  }

  return sum;
}

export async function getReferralAmounts(referralId: number, chainId: number): Promise<ReferralStats> {
  const result = await readContract(wagmiConfig, {
    abi: PRESALE_ABI,
    address: PRESALE_CONTRACT_ADDRESS[chainId] as Address,
    args: [referralId],
    functionName: "referrals",
  });

  const [purchases, tokensSold, soldInUsd]: any = result;

  return {
    purchases,
    soldInUsd: soldInUsd, // / BigInt(10**6),
    tokensSold: tokensSold, // / BigInt(10**18),
  };
}

interface CommissionOptions {
  factorTokens?: boolean;
  leavePrecision?: boolean;
}

function mapLogs(referral: Referral, logs: EventLogWithTimestamp[]) {
  const percentages = referral.percentageLogs
    .map(x => ({ fee: x.fee, date: new Date(x.createdAt) }))
    .sort((a, b) => a.date > b.date ? 1 : -1);
   
  return logs.map(log => {
    const fee = percentages.find(x => x.date > log.time)?.fee
      ?? referral.fee

    return { ...log, fee }
  });
}

export function calculateCommission(node: Referral, logs: EventLogWithTimestamp[], options?: CommissionOptions): ReferralStats {
  // const fee = getFeeFactor(node);
  // const stat = stats[node.id] ?? emptyStat();

  const rootLogs = mapLogs(node, logs);
  const current = rootLogs
    .filter(x => getArg<number>(x, 'referrerId') === node.id)
    .reduce((acc, log) => {
      return addStats(acc, factorStats(getStat(log), BigInt(log.fee), options?.factorTokens))
    }, emptyStat())

  // const current = factorStats(stat, fee, options?.factorTokens);

  const subtreeList = Object.keys(node.subleads ?? {})
    .map(key => node.subleads?.[key])
    .map(x => {
      return subtreeSum(logs, x, node, options?.factorTokens) 
    })

  const subtree = subtreeList
    .reduce((acc, e) => addStats(acc, e), emptyStat())

  const result = addStats(current, subtree);

  if (!options?.leavePrecision) {
    result.soldInUsd /= BigInt(1e4);
    result.tokensSold /= BigInt(1e18);
  }

  return result;
}

export function calculateEarningByToken(tree: Referral, logs: EventLogWithTimestamp[]) {
  const nodes = [] as Referral[];
  const queue = [tree];

  while (queue.length > 0) {
    const current = queue.pop()!;

    nodes.push(current);

    queue.push(
      ...Object
        .keys(current.subleads ?? {})
        .map(x => current.subleads?.[x]!)
    );
  }

  const ids = new Set(nodes.map(x => x.id) ?? []);
  const relevantLogs = logs
    .filter(x => ids.has((x.args as any)['referrerId'] as number));

  if (!relevantLogs.length) {
    return {};
  }

  const tokens = [...new Set(relevantLogs.map(x => (x.args as any)['tokenSold']))];
  const commission: Record<string, ReferralStats> = {};

  console.log('Logs for referral: ', relevantLogs);
  console.log('Tokens: ', tokens);

  for (const token of tokens) {
    const tokenLogs = relevantLogs
      .filter(x => getArg<string>(x, 'tokenSold') === token)

    commission[token] = calculateCommission(tree, tokenLogs, { factorTokens: true, leavePrecision: true });
  }

  return commission;
}

export function calculateStats(logs: EventLog[], tokenKey = 'tokenSoldAmount') {
  const stats = {} as StatsMap;

  for (const entry of logs) {
    const args = (entry.args as any)
    const stat = stats[Number(args['referrerId'] as number)] ?? {
      purchases: 0,
      soldInUsd: 0n,
      tokensSold: 0n
    };

    stat.purchases += 1;
    stat.soldInUsd += BigInt(args['tokensSoldAmountInUsd']);
    stat.tokensSold += BigInt(args[tokenKey]);

    stats[Number(args['referrerId'] as number)] = stat;
  }

  return stats;
}